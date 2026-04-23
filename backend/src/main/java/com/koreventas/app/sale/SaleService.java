package com.koreventas.app.sale;

import com.koreventas.app.catalog.ServiceRepository;
import com.koreventas.app.customer.Customer;
import com.koreventas.app.customer.CustomerRepository;
import com.koreventas.app.product.Product;
import com.koreventas.app.product.ProductNotFoundException;
import com.koreventas.app.product.ProductRepository;
import com.koreventas.app.sale.dto.CreateSaleRequest;
// Importamos tu nuevo DTO
import com.koreventas.app.sale.dto.DashboardResumenDTO; 
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

  private final SaleRepository sales;
  private final ProductRepository products;
  private final CustomerRepository customers;
  private final ServiceRepository services;

  @PersistenceContext
  private EntityManager em;

  public SaleService(SaleRepository sales, ProductRepository products,
                     CustomerRepository customers, ServiceRepository services) {
    this.sales = sales;
    this.products = products;
    this.customers = customers;
    this.services = services;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

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

    // Procesar cada item del carrito (producto o servicio)
    for (CreateSaleRequest.ItemRequest itemReq : req.items()) {
      if (itemReq.isService()) {
        var service = services.findById(itemReq.serviceId())
            .orElseThrow(() -> new IllegalStateException("Servicio no encontrado: " + itemReq.serviceId()));
        SaleItem item = SaleItem.forService(
            tenantId,
            sale.getId(),
            service.getId(),
            service.getName(),
            service.getPrice(),
            service.getTaxRate()
        );
        sale.addItem(item);
      } else {
        Product product = products.findById(itemReq.productId())
            .orElseThrow(() -> new ProductNotFoundException(itemReq.productId()));

        // Descontar stock (lanza excepción si no hay suficiente)
        product.decrementStock(itemReq.quantity());
        products.save(product);

        SaleItem item = SaleItem.forProduct(
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
    return sales.findByDateRangeAndTenantId(TenantContext.get(), startOfDay, endOfDay);
  }

  @Transactional(readOnly = true)
  public List<Sale> findByCustomer(UUID customerId) {
    applyTenant();
    return sales.findByCustomerIdAndTenantId(customerId, TenantContext.get());
  }

  @Transactional(readOnly = true)
  public List<Sale> findByDateRange(OffsetDateTime from, OffsetDateTime to) {
    applyTenant();
    return sales.findByDateRangeAndTenantId(TenantContext.get(), from, to);
  }
@Transactional(readOnly = true)
  public DashboardResumenDTO obtenerResumenDashboard() {
    applyTenant(); // Aplica seguridad RLS
    UUID tenantId = TenantContext.get();

    // 1. Establecemos la zona horaria correcta para los cortes de caja
    ZoneId zoneId = ZoneId.of("America/Bogota");
    LocalDate today = LocalDate.now(zoneId);

    // 2. DÍA (Desde las 00:00:00 hasta las 23:59:59 de hoy)
    OffsetDateTime startOfDay = today.atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    OffsetDateTime endOfDay = today.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

    // 3. SEMANA (Desde el Lunes a las 00:00:00 hasta el Domingo a las 23:59:59)
    LocalDate startOfWeekDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    OffsetDateTime startOfWeek = startOfWeekDate.atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    OffsetDateTime endOfWeek = startOfWeekDate.plusDays(6).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

    // 4. MES (Desde el día 1 a las 00:00:00 hasta el último día del mes a las 23:59:59)
    LocalDate startOfMonthDate = today.with(TemporalAdjusters.firstDayOfMonth());
    OffsetDateTime startOfMonth = startOfMonthDate.atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    
    LocalDate endOfMonthDate = today.with(TemporalAdjusters.lastDayOfMonth());
    OffsetDateTime endOfMonth = endOfMonthDate.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

    // 5. Consultas a la base de datos
    // Nota: Es buena práctica asegurar que no devuelvan null si no hay ventas.
    // Si tu query en SQL ya usa COALESCE(SUM(total), 0), esto está perfecto.
    BigDecimal ventasDia = sales.sumSalesByTenantAndDateRange(tenantId, startOfDay, endOfDay);
    BigDecimal ventasSemana = sales.sumSalesByTenantAndDateRange(tenantId, startOfWeek, endOfWeek);
    BigDecimal ventasMes = sales.sumSalesByTenantAndDateRange(tenantId, startOfMonth, endOfMonth);
    BigDecimal ventasTotales = sales.sumTotalSalesByTenant(tenantId);

    return new DashboardResumenDTO(
        ventasDia != null ? ventasDia : BigDecimal.ZERO, 
        ventasSemana != null ? ventasSemana : BigDecimal.ZERO, 
        ventasMes != null ? ventasMes : BigDecimal.ZERO, 
        ventasTotales != null ? ventasTotales : BigDecimal.ZERO
    );
  }
}