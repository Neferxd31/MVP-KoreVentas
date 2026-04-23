package com.koreventas.app.expense;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
public class Expense {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "category_id")
  private UUID categoryId;

  @Column(nullable = false, length = 300)
  private String description;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal amount;

  @Column(name = "payment_method", nullable = false, length = 30)
  private String paymentMethod;

  @Column(name = "expense_date", nullable = false)
  private LocalDate expenseDate;

  private String notes;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected Expense() {}

  public Expense(UUID tenantId, String description, BigDecimal amount, LocalDate expenseDate) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.description = description;
    this.amount = amount;
    this.expenseDate = expenseDate == null ? LocalDate.now() : expenseDate;
    this.paymentMethod = "EFECTIVO";
    this.createdAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getCategoryId() { return categoryId; }
  public String getDescription() { return description; }
  public BigDecimal getAmount() { return amount; }
  public String getPaymentMethod() { return paymentMethod; }
  public LocalDate getExpenseDate() { return expenseDate; }
  public String getNotes() { return notes; }
  public OffsetDateTime getCreatedAt() { return createdAt; }

  public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
  public void setDescription(String description) { this.description = description; }
  public void setAmount(BigDecimal amount) { this.amount = amount; }
  public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
  public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
  public void setNotes(String notes) { this.notes = notes; }
}
