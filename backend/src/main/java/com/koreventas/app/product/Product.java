package com.koreventas.app.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "category_id")
  private UUID categoryId;

  @Column(nullable = false, length = 200)
  private String name;

  private String description;

  @Column(length = 100)
  private String barcode;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(precision = 12, scale = 2)
  private BigDecimal cost;

  @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
  private BigDecimal taxRate;

  @Column(nullable = false)
  private int stock;

  @Column(name = "stock_alert", nullable = false)
  private int stockAlert;

  @Column(name = "image_url")
  private String imageUrl;

  @Column(name = "is_favorite", nullable = false)
  private boolean favorite;

  @Column(nullable = false)
  private boolean active;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Product() {}

  public Product(UUID tenantId, String name, BigDecimal price, BigDecimal taxRate) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.name = name;
    this.price = price;
    this.taxRate = taxRate;
    this.stock = 0;
    this.stockAlert = 5;
    this.favorite = false;
    this.active = true;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  // Lógica de negocio: descontar stock al vender
  public void decrementStock(int quantity) {
    if (quantity > this.stock) {
      throw new IllegalStateException("Stock insuficiente para " + name
          + ". Disponible: " + stock + ", solicitado: " + quantity);
    }
    this.stock -= quantity;
    this.updatedAt = OffsetDateTime.now();
  }

  public boolean isLowStock() {
    return this.stock <= this.stockAlert;
  }

  // Getters
  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getCategoryId() { return categoryId; }
  public String getName() { return name; }
  public String getDescription() { return description; }
  public String getBarcode() { return barcode; }
  public BigDecimal getPrice() { return price; }
  public BigDecimal getCost() { return cost; }
  public BigDecimal getTaxRate() { return taxRate; }
  public int getStock() { return stock; }
  public int getStockAlert() { return stockAlert; }
  public String getImageUrl() { return imageUrl; }
  public boolean isFavorite() { return favorite; }
  public boolean isActive() { return active; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }

  // Setters para update
  public void setName(String name) { this.name = name; this.updatedAt = OffsetDateTime.now(); }
  public void setDescription(String description) { this.description = description; this.updatedAt = OffsetDateTime.now(); }
  public void setBarcode(String barcode) { this.barcode = barcode; this.updatedAt = OffsetDateTime.now(); }
  public void setPrice(BigDecimal price) { this.price = price; this.updatedAt = OffsetDateTime.now(); }
  public void setCost(BigDecimal cost) { this.cost = cost; this.updatedAt = OffsetDateTime.now(); }
  public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; this.updatedAt = OffsetDateTime.now(); }
  public void setStock(int stock) { this.stock = stock; this.updatedAt = OffsetDateTime.now(); }
  public void setStockAlert(int stockAlert) { this.stockAlert = stockAlert; this.updatedAt = OffsetDateTime.now(); }
  public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; this.updatedAt = OffsetDateTime.now(); }
  public void setFavorite(boolean favorite) { this.favorite = favorite; this.updatedAt = OffsetDateTime.now(); }
  public void setActive(boolean active) { this.active = active; this.updatedAt = OffsetDateTime.now(); }
  public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; this.updatedAt = OffsetDateTime.now(); }
}
