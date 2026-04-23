package com.koreventas.app.appointment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
public class Appointment {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "service_id", nullable = false)
  private UUID serviceId;

  @Column(name = "customer_id")
  private UUID customerId;

  @Column(name = "employee_id")
  private UUID employeeId;

  // Snapshots al momento de agendar
  @Column(name = "service_name", nullable = false, length = 200)
  private String serviceName;

  @Column(name = "customer_name", length = 150)
  private String customerName;

  @Column(name = "customer_phone", length = 30)
  private String customerPhone;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(name = "duration_minutes", nullable = false)
  private int durationMinutes;

  @Column(name = "start_at", nullable = false)
  private OffsetDateTime startAt;

  @Column(name = "end_at", nullable = false)
  private OffsetDateTime endAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AppointmentStatus status;

  private String notes;

  @Column(name = "sale_id")
  private UUID saleId;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Appointment() {}

  public Appointment(UUID tenantId, UUID serviceId, String serviceName,
                     BigDecimal price, int durationMinutes, OffsetDateTime startAt) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.serviceId = serviceId;
    this.serviceName = serviceName;
    this.price = price;
    this.durationMinutes = durationMinutes;
    this.startAt = startAt;
    this.endAt = startAt.plusMinutes(durationMinutes);
    this.status = AppointmentStatus.AGENDADA;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  private void touch() { this.updatedAt = OffsetDateTime.now(); }

  public boolean isCompleted() { return status == AppointmentStatus.COMPLETADA; }
  public boolean isCancelled() { return status == AppointmentStatus.CANCELADA; }

  /** Reagendar: recalcula endAt automáticamente. */
  public void reschedule(OffsetDateTime newStart, int newDurationMinutes) {
    this.startAt = newStart;
    this.durationMinutes = newDurationMinutes;
    this.endAt = newStart.plusMinutes(newDurationMinutes);
    touch();
  }

  public void setStatus(AppointmentStatus status) { this.status = status; touch(); }
  public void setSaleId(UUID saleId) { this.saleId = saleId; touch(); }

  // Getters
  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getServiceId() { return serviceId; }
  public UUID getCustomerId() { return customerId; }
  public UUID getEmployeeId() { return employeeId; }
  public String getServiceName() { return serviceName; }
  public String getCustomerName() { return customerName; }
  public String getCustomerPhone() { return customerPhone; }
  public BigDecimal getPrice() { return price; }
  public int getDurationMinutes() { return durationMinutes; }
  public OffsetDateTime getStartAt() { return startAt; }
  public OffsetDateTime getEndAt() { return endAt; }
  public AppointmentStatus getStatus() { return status; }
  public String getNotes() { return notes; }
  public UUID getSaleId() { return saleId; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }

  // Setters
  public void setCustomerId(UUID customerId) { this.customerId = customerId; touch(); }
  public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; touch(); }
  public void setCustomerName(String customerName) { this.customerName = customerName; touch(); }
  public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; touch(); }
  public void setNotes(String notes) { this.notes = notes; touch(); }
  public void setPrice(BigDecimal price) { this.price = price; touch(); }
}
