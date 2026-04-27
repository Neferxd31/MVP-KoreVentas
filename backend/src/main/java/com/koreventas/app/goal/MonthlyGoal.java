package com.koreventas.app.goal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "monthly_goals")
public class MonthlyGoal {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "period_year", nullable = false)
  private int periodYear;

  @Column(name = "period_month", nullable = false)
  private int periodMonth;

  @Column(name = "revenue_target", nullable = false, precision = 14, scale = 2)
  private BigDecimal revenueTarget;

  @Column(name = "orders_target", nullable = false)
  private int ordersTarget;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected MonthlyGoal() {}

  public MonthlyGoal(UUID tenantId, int year, int month,
                     BigDecimal revenueTarget, int ordersTarget) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.periodYear = year;
    this.periodMonth = month;
    this.revenueTarget = revenueTarget;
    this.ordersTarget = ordersTarget;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  public void update(BigDecimal revenueTarget, int ordersTarget) {
    this.revenueTarget = revenueTarget;
    this.ordersTarget = ordersTarget;
    this.updatedAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public int getPeriodYear() { return periodYear; }
  public int getPeriodMonth() { return periodMonth; }
  public BigDecimal getRevenueTarget() { return revenueTarget; }
  public int getOrdersTarget() { return ordersTarget; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
