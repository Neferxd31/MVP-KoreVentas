package com.koreventas.app.customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
public class Customer {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Column(length = 30)
  private String phone;

  @Column(length = 180)
  private String email;

  private String notes;

  private LocalDate birthday;

  @Enumerated(EnumType.STRING)
  @Column(name = "auto_tag", nullable = false, length = 20)
  private CustomerTag autoTag;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "manual_tags", nullable = false)
  private List<String> manualTags;

  @Column(name = "total_purchases", nullable = false)
  private int totalPurchases;

  @Column(name = "total_spent", nullable = false, precision = 14, scale = 2)
  private BigDecimal totalSpent;

  @Column(name = "avg_ticket", nullable = false, precision = 12, scale = 2)
  private BigDecimal avgTicket;

  @Column(name = "last_visit_at")
  private OffsetDateTime lastVisitAt;

  @Column(name = "avg_days_between_visits", precision = 6, scale = 1)
  private BigDecimal avgDaysBetweenVisits;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Customer() {}

  public Customer(UUID tenantId, String fullName, String phone) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.fullName = fullName;
    this.phone = phone;
    this.autoTag = CustomerTag.NUEVO;
    this.manualTags = new ArrayList<>();
    this.totalPurchases = 0;
    this.totalSpent = BigDecimal.ZERO;
    this.avgTicket = BigDecimal.ZERO;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  // ── Lógica de negocio: registrar una compra y recalcular etiqueta ──

  public void recordPurchase(BigDecimal amount) {
    OffsetDateTime now = OffsetDateTime.now();

    // Calcular días desde última visita para promedio
    if (this.lastVisitAt != null) {
      long daysSinceLast = ChronoUnit.DAYS.between(this.lastVisitAt, now);
      if (this.avgDaysBetweenVisits == null) {
        this.avgDaysBetweenVisits = BigDecimal.valueOf(daysSinceLast);
      } else {
        // Media móvil simple
        this.avgDaysBetweenVisits = this.avgDaysBetweenVisits
            .add(BigDecimal.valueOf(daysSinceLast))
            .divide(BigDecimal.valueOf(2), 1, RoundingMode.HALF_UP);
      }
    }

    this.lastVisitAt = now;
    this.totalPurchases++;
    this.totalSpent = this.totalSpent.add(amount);
    this.avgTicket = this.totalSpent.divide(
        BigDecimal.valueOf(this.totalPurchases), 2, RoundingMode.HALF_UP);
    this.updatedAt = now;

    recalculateTag();
  }

  /**
   * Auto-etiquetado por comportamiento (RF-11):
   * - NUEVO: menos de 3 compras
   * - FRECUENTE: 3+ compras
   * - VIP: 10+ compras O ticket promedio alto (>= $100.000 COP)
   * - INACTIVO: más de 60 días sin visita
   */
  public void recalculateTag() {
    // Inactivo tiene prioridad
    if (this.lastVisitAt != null) {
      long daysSinceLastVisit = ChronoUnit.DAYS.between(this.lastVisitAt, OffsetDateTime.now());
      if (daysSinceLastVisit > 60) {
        this.autoTag = CustomerTag.INACTIVO;
        return;
      }
    }

    if (this.totalPurchases >= 10
        || this.avgTicket.compareTo(new BigDecimal("100000")) >= 0) {
      this.autoTag = CustomerTag.VIP;
    } else if (this.totalPurchases >= 3) {
      this.autoTag = CustomerTag.FRECUENTE;
    } else {
      this.autoTag = CustomerTag.NUEVO;
    }
  }

  public long daysSinceLastVisit() {
    if (this.lastVisitAt == null) return -1;
    return ChronoUnit.DAYS.between(this.lastVisitAt, OffsetDateTime.now());
  }

  // Getters
  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public String getFullName() { return fullName; }
  public String getPhone() { return phone; }
  public String getEmail() { return email; }
  public String getNotes() { return notes; }
  public LocalDate getBirthday() { return birthday; }
  public CustomerTag getAutoTag() { return autoTag; }
  public List<String> getManualTags() { return manualTags; }
  public int getTotalPurchases() { return totalPurchases; }
  public BigDecimal getTotalSpent() { return totalSpent; }
  public BigDecimal getAvgTicket() { return avgTicket; }
  public OffsetDateTime getLastVisitAt() { return lastVisitAt; }
  public BigDecimal getAvgDaysBetweenVisits() { return avgDaysBetweenVisits; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }

  // Setters
  public void setFullName(String fullName) { this.fullName = fullName; this.updatedAt = OffsetDateTime.now(); }
  public void setPhone(String phone) { this.phone = phone; this.updatedAt = OffsetDateTime.now(); }
  public void setEmail(String email) { this.email = email; this.updatedAt = OffsetDateTime.now(); }
  public void setNotes(String notes) { this.notes = notes; this.updatedAt = OffsetDateTime.now(); }
  public void setBirthday(LocalDate birthday) { this.birthday = birthday; this.updatedAt = OffsetDateTime.now(); }
  public void setManualTags(List<String> manualTags) { this.manualTags = manualTags; this.updatedAt = OffsetDateTime.now(); }
}
