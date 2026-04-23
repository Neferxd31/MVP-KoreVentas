package com.koreventas.app.catalog;

import com.koreventas.app.catalog.dto.CreateServiceRequest;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceService {

  private final ServiceRepository services;

  @PersistenceContext
  private EntityManager em;

  public ServiceService(ServiceRepository services) {
    this.services = services;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public List<Service> findAll() {
    applyTenant();
    return services.findAllActiveOrdered();
  }

  @Transactional(readOnly = true)
  public Service findById(UUID id) {
    applyTenant();
    return services.findById(id)
        .orElseThrow(() -> new IllegalStateException("Servicio no encontrado: " + id));
  }

  @Transactional
  public Service create(CreateServiceRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();
    BigDecimal taxRate = req.taxRate() == null ? BigDecimal.ZERO : req.taxRate();
    Service s = new Service(tenantId, req.name(), req.durationMinutes(),
        req.price(), taxRate, req.color());
    s.setDescription(req.description());
    return services.save(s);
  }

  @Transactional
  public Service update(UUID id, CreateServiceRequest req) {
    applyTenant();
    Service s = services.findById(id)
        .orElseThrow(() -> new IllegalStateException("Servicio no encontrado: " + id));
    if (req.name() != null) s.setName(req.name());
    s.setDescription(req.description());
    if (req.durationMinutes() != null) s.setDurationMinutes(req.durationMinutes());
    if (req.price() != null) s.setPrice(req.price());
    if (req.taxRate() != null) s.setTaxRate(req.taxRate());
    if (req.color() != null && !req.color().isBlank()) s.setColor(req.color());
    return services.save(s);
  }

  @Transactional
  public void delete(UUID id) {
    applyTenant();
    Service s = services.findById(id)
        .orElseThrow(() -> new IllegalStateException("Servicio no encontrado: " + id));
    s.setActive(false); // soft delete
    services.save(s);
  }
}
