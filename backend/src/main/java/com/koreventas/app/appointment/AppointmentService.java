package com.koreventas.app.appointment;

import com.koreventas.app.appointment.dto.CreateAppointmentRequest;
import com.koreventas.app.appointment.dto.UpdateAppointmentStatusRequest;
import com.koreventas.app.catalog.Service;
import com.koreventas.app.catalog.ServiceRepository;
import com.koreventas.app.customer.Customer;
import com.koreventas.app.customer.CustomerRepository;
import com.koreventas.app.sale.PaymentMethod;
import com.koreventas.app.sale.Sale;
import com.koreventas.app.sale.SaleItem;
import com.koreventas.app.sale.SaleRepository;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class AppointmentService {

  private final AppointmentRepository appointments;
  private final ServiceRepository services;
  private final CustomerRepository customers;
  private final SaleRepository sales;

  @PersistenceContext
  private EntityManager em;

  public AppointmentService(AppointmentRepository appointments,
                            ServiceRepository services,
                            CustomerRepository customers,
                            SaleRepository sales) {
    this.appointments = appointments;
    this.services = services;
    this.customers = customers;
    this.sales = sales;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public List<Appointment> findInRange(OffsetDateTime from, OffsetDateTime to) {
    applyTenant();
    return appointments.findInRange(from, to);
  }

  @Transactional(readOnly = true)
  public Appointment findById(UUID id) {
    applyTenant();
    return appointments.findById(id)
        .orElseThrow(() -> new IllegalStateException("Cita no encontrada: " + id));
  }

  @Transactional
  public Appointment create(CreateAppointmentRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();

    Service service = services.findById(req.serviceId())
        .orElseThrow(() -> new IllegalStateException("Servicio no encontrado: " + req.serviceId()));

    // Snapshot de datos del servicio al momento de agendar
    Appointment appointment = new Appointment(
        tenantId,
        service.getId(),
        service.getName(),
        service.getPrice(),
        service.getDurationMinutes(),
        req.startAt()
    );

    // Resolver cliente: por ID o por teléfono
    UUID customerId = resolveCustomer(req.customerId(), req.customerPhone());
    if (customerId != null) {
      appointment.setCustomerId(customerId);
      customers.findById(customerId).ifPresent(c -> {
        appointment.setCustomerName(c.getFullName());
        appointment.setCustomerPhone(c.getPhone());
      });
    } else {
      // Cliente walk-in: guardamos solo los datos ingresados
      appointment.setCustomerName(req.customerName());
      appointment.setCustomerPhone(req.customerPhone());
    }

    if (req.employeeId() != null) appointment.setEmployeeId(req.employeeId());
    if (req.notes() != null) appointment.setNotes(req.notes());

    return appointments.save(appointment);
  }

  @Transactional
  public Appointment updateStatus(UUID id, UpdateAppointmentStatusRequest req) {
    applyTenant();
    Appointment appointment = appointments.findById(id)
        .orElseThrow(() -> new IllegalStateException("Cita no encontrada: " + id));

    AppointmentStatus newStatus = req.status();
    appointment.setStatus(newStatus);

    // Al completar la cita se genera automáticamente la venta correspondiente
    if (newStatus == AppointmentStatus.COMPLETADA && appointment.getSaleId() == null) {
      Sale sale = createSaleFromAppointment(appointment, req.paymentMethod());
      appointment.setSaleId(sale.getId());
    }

    return appointments.save(appointment);
  }

  @Transactional
  public Appointment reschedule(UUID id, OffsetDateTime newStart) {
    applyTenant();
    Appointment appointment = appointments.findById(id)
        .orElseThrow(() -> new IllegalStateException("Cita no encontrada: " + id));
    appointment.reschedule(newStart, appointment.getDurationMinutes());
    return appointments.save(appointment);
  }

  @Transactional
  public void delete(UUID id) {
    applyTenant();
    Appointment appointment = appointments.findById(id)
        .orElseThrow(() -> new IllegalStateException("Cita no encontrada: " + id));
    appointment.setStatus(AppointmentStatus.CANCELADA);
    appointments.save(appointment);
  }

  private UUID resolveCustomer(UUID customerId, String customerPhone) {
    if (customerId != null) return customerId;
    if (customerPhone != null && !customerPhone.isBlank()) {
      return customers.findByPhone(customerPhone)
          .map(Customer::getId)
          .orElse(null);
    }
    return null;
  }

  /** Crea una venta a partir de una cita completada (cierra el loop agenda → ingresos). */
  private Sale createSaleFromAppointment(Appointment appointment, String paymentMethodRaw) {
    UUID tenantId = TenantContext.get();
    PaymentMethod method = paymentMethodRaw == null
        ? PaymentMethod.EFECTIVO
        : PaymentMethod.valueOf(paymentMethodRaw);

    Sale sale = new Sale(tenantId, method);
    if (appointment.getCustomerId() != null) sale.setCustomerId(appointment.getCustomerId());
    sale.setNotes("Cita: " + appointment.getServiceName());

    // Recuperar taxRate actual del servicio (si sigue existiendo)
    var taxRate = services.findById(appointment.getServiceId())
        .map(Service::getTaxRate)
        .orElse(java.math.BigDecimal.ZERO);

    SaleItem item = SaleItem.forService(
        tenantId,
        sale.getId(),
        appointment.getServiceId(),
        appointment.getServiceName(),
        appointment.getPrice(),
        taxRate
    );
    sale.addItem(item);

    Sale saved = sales.save(sale);

    // Actualizar métricas del cliente si aplica
    if (appointment.getCustomerId() != null) {
      customers.findById(appointment.getCustomerId()).ifPresent(customer -> {
        customer.recordPurchase(saved.getTotal());
        customers.save(customer);
      });
    }

    return saved;
  }
}
