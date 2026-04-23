package com.koreventas.app.expense;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expense_categories")
public class ExpenseCategory {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(nullable = false, length = 80)
  private String name;

  @Column(nullable = false, length = 20)
  private String color;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected ExpenseCategory() {}

  public ExpenseCategory(UUID tenantId, String name, String color) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.name = name;
    this.color = (color == null || color.isBlank()) ? "#64748b" : color;
    this.createdAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public String getName() { return name; }
  public String getColor() { return color; }
  public OffsetDateTime getCreatedAt() { return createdAt; }

  public void setName(String name) { this.name = name; }
  public void setColor(String color) { this.color = color; }
}
