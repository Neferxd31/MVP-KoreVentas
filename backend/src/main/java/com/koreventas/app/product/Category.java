package com.koreventas.app.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "categories")
public class Category {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected Category() {}

  public Category(UUID tenantId, String name) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.name = name;
    this.createdAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
}
