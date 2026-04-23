package com.koreventas.app.employee;

import com.koreventas.app.employee.dto.CreateEmployeeRequest;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EmployeeService {

  private final EmployeeRepository employees;

  @PersistenceContext
  private EntityManager em;

  public EmployeeService(EmployeeRepository employees) {
    this.employees = employees;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public List<Employee> findAll() {
    applyTenant();
    return employees.findAllActiveOrdered();
  }

  @Transactional(readOnly = true)
  public Employee findById(UUID id) {
    applyTenant();
    return employees.findById(id)
        .orElseThrow(() -> new IllegalStateException("Empleado no encontrado: " + id));
  }

  @Transactional
  public Employee create(CreateEmployeeRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();
    Employee e = new Employee(tenantId, req.fullName(), req.role(), req.color());
    e.setPhone(req.phone());
    return employees.save(e);
  }

  @Transactional
  public Employee update(UUID id, CreateEmployeeRequest req) {
    applyTenant();
    Employee e = employees.findById(id)
        .orElseThrow(() -> new IllegalStateException("Empleado no encontrado: " + id));
    if (req.fullName() != null) e.setFullName(req.fullName());
    e.setRole(req.role());
    e.setPhone(req.phone());
    if (req.color() != null && !req.color().isBlank()) e.setColor(req.color());
    return employees.save(e);
  }

  @Transactional
  public void delete(UUID id) {
    applyTenant();
    Employee e = employees.findById(id)
        .orElseThrow(() -> new IllegalStateException("Empleado no encontrado: " + id));
    e.setActive(false);
    employees.save(e);
  }
}
