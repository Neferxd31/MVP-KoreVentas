package com.koreventas.app.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "employees")
public class Employee {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Column(length = 80)
  private String role;

  @Column(length = 30)
  private String phone;

  @Column(nullable = false, length = 20)
  private String color;

  @Column(nullable = false)
  private boolean active;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Employee() {}

  public Employee(UUID tenantId, String fullName, String role, String color) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.fullName = fullName;
    this.role = role;
    this.color = (color == null || color.isBlank()) ? "#64748b" : color;
    this.active = true;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  private void touch() { this.updatedAt = OffsetDateTime.now(); }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public String getFullName() { return fullName; }
  public String getRole() { return role; }
  public String getPhone() { return phone; }
  public String getColor() { return color; }
  public boolean isActive() { return active; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }

  public void setFullName(String fullName) { this.fullName = fullName; touch(); }
  public void setRole(String role) { this.role = role; touch(); }
  public void setPhone(String phone) { this.phone = phone; touch(); }
  public void setColor(String color) { this.color = color; touch(); }
  public void setActive(boolean active) { this.active = active; touch(); }
}
