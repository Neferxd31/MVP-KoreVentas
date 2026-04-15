package com.koreventas.app.tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

  @Id
  private UUID id;

  @Column(nullable = false, length = 150)
  private String name;

  @Column(name = "business_type", nullable = false, length = 50)
  private String businessType;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Tenant() {}

  public Tenant(UUID id, String name, String businessType) {
    this.id = id;
    this.name = name;
    this.businessType = businessType;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public String getName() { return name; }
  public String getBusinessType() { return businessType; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
