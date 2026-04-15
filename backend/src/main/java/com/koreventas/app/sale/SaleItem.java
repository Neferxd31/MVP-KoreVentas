package com.koreventas.app.sale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sale_items")
public class SaleItem {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "sale_id", nullable = false)
  private UUID saleId;

  @Column(name = "product_id", nullable = false)
  private UUID productId;

  @Column(name = "product_name", nullable = false, length = 200)
  private String productName;

  @Column(nullable = false)
  private int quantity;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;

  @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
  private BigDecimal taxRate;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal subtotal;

  @Column(name = "tax_amount", nullable = false, precision = 14, scale = 2)
  private BigDecimal taxAmount;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal total;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected SaleItem() {}

  public SaleItem(UUID tenantId, UUID saleId, UUID productId, String productName,
                  int quantity, BigDecimal unitPrice, BigDecimal taxRate) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.saleId = saleId;
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.taxRate = taxRate;
    this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    this.taxAmount = this.subtotal.multiply(taxRate)
        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    this.total = this.subtotal.add(this.taxAmount);
    this.createdAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getSaleId() { return saleId; }
  public UUID getProductId() { return productId; }
  public String getProductName() { return productName; }
  public int getQuantity() { return quantity; }
  public BigDecimal getUnitPrice() { return unitPrice; }
  public BigDecimal getTaxRate() { return taxRate; }
  public BigDecimal getSubtotal() { return subtotal; }
  public BigDecimal getTaxAmount() { return taxAmount; }
  public BigDecimal getTotal() { return total; }
}
