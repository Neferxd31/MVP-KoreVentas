package com.koreventas.app.cash;

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
@Table(name = "cash_sessions")
public class CashSession {

  public enum Status { ABIERTA, CERRADA }

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "opened_by")
  private UUID openedBy;

  @Column(name = "opened_at", nullable = false)
  private OffsetDateTime openedAt;

  @Column(name = "closed_at")
  private OffsetDateTime closedAt;

  @Column(name = "opening_amount", nullable = false, precision = 14, scale = 2)
  private BigDecimal openingAmount;

  @Column(name = "counted_amount", precision = 14, scale = 2)
  private BigDecimal countedAmount;

  @Column(name = "expected_amount", precision = 14, scale = 2)
  private BigDecimal expectedAmount;

  @Column(precision = 14, scale = 2)
  private BigDecimal difference;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Status status;

  private String notes;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected CashSession() {}

  public CashSession(UUID tenantId, UUID openedBy, BigDecimal openingAmount) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.openedBy = openedBy;
    this.openingAmount = openingAmount == null ? BigDecimal.ZERO : openingAmount;
    this.openedAt = OffsetDateTime.now();
    this.status = Status.ABIERTA;
    this.createdAt = OffsetDateTime.now();
  }

  /** Cierra la sesión calculando diferencia entre contado y esperado. */
  public void close(BigDecimal counted, BigDecimal expected, String notes) {
    this.countedAmount = counted;
    this.expectedAmount = expected;
    this.difference = counted.subtract(expected);
    this.notes = notes;
    this.closedAt = OffsetDateTime.now();
    this.status = Status.CERRADA;
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getOpenedBy() { return openedBy; }
  public OffsetDateTime getOpenedAt() { return openedAt; }
  public OffsetDateTime getClosedAt() { return closedAt; }
  public BigDecimal getOpeningAmount() { return openingAmount; }
  public BigDecimal getCountedAmount() { return countedAmount; }
  public BigDecimal getExpectedAmount() { return expectedAmount; }
  public BigDecimal getDifference() { return difference; }
  public Status getStatus() { return status; }
  public String getNotes() { return notes; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
}
