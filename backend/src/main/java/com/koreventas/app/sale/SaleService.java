package com.koreventas.app.sale;

import com.koreventas.app.customer.Customer;
import com.koreventas.app.customer.CustomerRepository;
import com.koreventas.app.product.Product;
import com.koreventas.app.product.ProductNotFoundException;
import com.koreventas.app.product.ProductRepository;
import com.koreventas.app.sale.dto.CreateSaleRequest;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

  private final SaleRepository sales;
  private final ProductRepository products;
  private final CustomerRepository customers;

  @PersistenceContext
  private EntityManager em;

  public SaleService(SaleRepository sales, ProductRepository products,
                     CustomerRepository customers) {
    this.sales = sales;
    this.products = products;
    this.customers = customers;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  /**
   * Crear una venta completa atómicamente:
   * 1. Validar que todos los productos existen y tienen stock
   * 2. Descontar stock de cada producto
   * 3. Vincular cliente por ID o por teléfono automáticamente (RF-06)
   * 4. Calcular IVA por línea según tarifa del producto
   * 5. Registrar compra en el cliente (actualiza métricas y auto-etiqueta)
   */
  @Transactional
  public Sale createSale(CreateSaleRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();

    PaymentMethod method = PaymentMethod.valueOf(req.paymentMethod());
    Sale sale = new Sale(tenantId, method);
    sale.setNotes(req.notes());

    // Resolver cliente: por ID directo o por teléfono (vinculación automática)
    UUID customerId = resolveCustomer(req.customerId(), req.customerPhone());
    if (customerId != null) {
      sale.setCustomerId(customerId);
    }

    // Procesar cada item del carrito
    for (CreateSaleRequest.ItemRequest itemReq : req.items()) {
      Product product = products.findById(itemReq.productId())
          .orElseThrow(() -> new ProductNotFoundException(itemReq.productId()));

      // Descontar stock (lanza excepción si no hay suficiente)
      product.decrementStock(itemReq.quantity());
      products.save(product);

      // Crear línea de venta con snapshot del precio y nombre
      SaleItem item = new SaleItem(
          tenantId,
          sale.getId(),
          product.getId(),
          product.getName(),
          itemReq.quantity(),
          product.getPrice(),
          product.getTaxRate()
      );
      sale.addItem(item);
    }

    Sale saved = sales.save(sale);

    // Registrar la compra en el cliente (actualiza métricas + auto-etiqueta)
    if (customerId != null) {
      customers.findById(customerId).ifPresent(customer -> {
        customer.recordPurchase(saved.getTotal());
        customers.save(customer);
      });
    }

    return saved;
  }

  /**
   * Vinculación automática por teléfono (RF-06):
   * Si viene customerId, lo usa directo.
   * Si viene customerPhone, busca si existe un cliente con ese teléfono.
   */
  private UUID resolveCustomer(UUID customerId, String customerPhone) {
    if (customerId != null) return customerId;
    if (customerPhone != null && !customerPhone.isBlank()) {
      return customers.findByPhone(customerPhone)
          .map(Customer::getId)
          .orElse(null);
    }
    return null;
  }

  @Transactional(readOnly = true)
  public Sale findById(UUID id) {
    applyTenant();
    return sales.findById(id)
        .orElseThrow(() -> new IllegalStateException("Venta no encontrada: " + id));
  }

  @Transactional(readOnly = true)
  public List<Sale> findToday() {
    applyTenant();
    OffsetDateTime startOfDay = LocalDate.now().atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    OffsetDateTime endOfDay = startOfDay.plusDays(1);
    return sales.findByDateRange(startOfDay, endOfDay);
  }

  @Transactional(readOnly = true)
  public List<Sale> findByCustomer(UUID customerId) {
    applyTenant();
    return sales.findByCustomerId(customerId);
  }

  @Transactional(readOnly = true)
  public List<Sale> findByDateRange(OffsetDateTime from, OffsetDateTime to) {
    applyTenant();
    return sales.findByDateRange(from, to);
  }
}
