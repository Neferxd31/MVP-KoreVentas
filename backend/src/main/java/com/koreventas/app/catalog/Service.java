package com.koreventas.app.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Servicio del catálogo (corte, color, masaje, asesoría, etc.).
 * Nombrado "Service" para reflejar el dominio. No confundir con @Service de Spring.
 */
@Entity
@Table(name = "services")
public class Service {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(nullable = false, length = 200)
  private String name;

  private String description;

  @Column(name = "duration_minutes", nullable = false)
  private int durationMinutes;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
  private BigDecimal taxRate;

  @Column(nullable = false, length = 20)
  private String color;

  @Column(nullable = false)
  private boolean active;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Service() {}

  public Service(UUID tenantId, String name, int durationMinutes,
                 BigDecimal price, BigDecimal taxRate, String color) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.name = name;
    this.durationMinutes = durationMinutes;
    this.price = price;
    this.taxRate = taxRate == null ? BigDecimal.ZERO : taxRate;
    this.color = (color == null || color.isBlank()) ? "#6366f1" : color;
    this.active = true;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  private void touch() { this.updatedAt = OffsetDateTime.now(); }

  // Getters
  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public String getName() { return name; }
  public String getDescription() { return description; }
  public int getDurationMinutes() { return durationMinutes; }
  public BigDecimal getPrice() { return price; }
  public BigDecimal getTaxRate() { return taxRate; }
  public String getColor() { return color; }
  public boolean isActive() { return active; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }

  // Setters con touch()
  public void setName(String name) { this.name = name; touch(); }
  public void setDescription(String description) { this.description = description; touch(); }
  public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; touch(); }
  public void setPrice(BigDecimal price) { this.price = price; touch(); }
  public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; touch(); }
  public void setColor(String color) { this.color = color; touch(); }
  public void setActive(boolean active) { this.active = active; touch(); }
}
