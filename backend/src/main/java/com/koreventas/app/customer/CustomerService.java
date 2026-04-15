package com.koreventas.app.customer;

import com.koreventas.app.customer.dto.CreateCustomerRequest;
import com.koreventas.app.customer.dto.UpdateCustomerRequest;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomerService {

  private final CustomerRepository customers;

  @PersistenceContext
  private EntityManager em;

  public CustomerService(CustomerRepository customers) {
    this.customers = customers;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public List<Customer> findAll() {
    applyTenant();
    return customers.findAll();
  }

  @Transactional(readOnly = true)
  public Customer findById(UUID id) {
    applyTenant();
    return customers.findById(id)
        .orElseThrow(() -> new CustomerNotFoundException(id));
  }

  /**
   * Buscar por teléfono — clave para vinculación automática (RF-06).
   * Retorna Optional para que el flujo de venta decida si crear o vincular.
   */
  @Transactional(readOnly = true)
  public Optional<Customer> findByPhone(String phone) {
    applyTenant();
    return customers.findByPhone(phone);
  }

  @Transactional(readOnly = true)
  public List<Customer> search(String query) {
    applyTenant();
    return customers.findByFullNameContainingIgnoreCase(query);
  }

  @Transactional(readOnly = true)
  public List<Customer> findByTag(CustomerTag tag) {
    applyTenant();
    return customers.findByAutoTag(tag);
  }

  /**
   * Clientes inactivos (>60 días sin visita).
   * Base para el Pulso del Negocio y campañas de reactivación.
   */
  @Transactional(readOnly = true)
  public List<Customer> findInactive() {
    applyTenant();
    return customers.findByAutoTag(CustomerTag.INACTIVO);
  }

  @Transactional
  public Customer create(CreateCustomerRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();

    // Verificar teléfono duplicado
    if (req.phone() != null && !req.phone().isBlank()) {
      customers.findByPhone(req.phone()).ifPresent(existing -> {
        throw new IllegalStateException("Ya existe un cliente con el teléfono " + req.phone());
      });
    }

    Customer customer = new Customer(tenantId, req.fullName(), req.phone());
    customer.setEmail(req.email());
    customer.setNotes(req.notes());
    customer.setBirthday(req.birthday());
    if (req.manualTags() != null) {
      customer.setManualTags(req.manualTags());
    }

    return customers.save(customer);
  }

  @Transactional
  public Customer update(UUID id, UpdateCustomerRequest req) {
    applyTenant();
    Customer customer = customers.findById(id)
        .orElseThrow(() -> new CustomerNotFoundException(id));

    if (req.fullName() != null) customer.setFullName(req.fullName());
    if (req.phone() != null) customer.setPhone(req.phone());
    if (req.email() != null) customer.setEmail(req.email());
    if (req.notes() != null) customer.setNotes(req.notes());
    if (req.birthday() != null) customer.setBirthday(req.birthday());
    if (req.manualTags() != null) customer.setManualTags(req.manualTags());

    return customers.save(customer);
  }

  @Transactional
  public void delete(UUID id) {
    applyTenant();
    if (!customers.existsById(id)) {
      throw new CustomerNotFoundException(id);
    }
    customers.deleteById(id);
  }

  /**
   * Recalcular etiquetas de todos los clientes del tenant.
   * Se puede llamar periódicamente o después de procesar ventas.
   */
  @Transactional
  public int recalculateAllTags() {
    applyTenant();
    List<Customer> all = customers.findAll();
    for (Customer c : all) {
      c.recalculateTag();
    }
    customers.saveAll(all);
    return all.size();
  }
}
