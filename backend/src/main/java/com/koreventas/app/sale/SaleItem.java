package com.koreventas.app.sale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Línea de venta. Polimórfica: puede referenciar un PRODUCT o un SERVICE.
 * Se guarda snapshot de nombre y precio para preservar la historia
 * aun si luego se edita o elimina el producto/servicio origen.
 */
@Entity
@Table(name = "sale_items")
public class SaleItem {

  public enum ItemType { PRODUCT, SERVICE }

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "sale_id", nullable = false)
  private UUID saleId;

  // Uno de los dos se llena según item_type
  @Column(name = "product_id")
  private UUID productId;

  @Column(name = "service_id")
  private UUID serviceId;

  @Enumerated(EnumType.STRING)
  @Column(name = "item_type", nullable = false, length = 20)
  private ItemType itemType;

  @Column(name = "product_name", nullable = false, length = 200)
  private String productName;  // snapshot del nombre (aplica a producto O servicio)

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

  /** Constructor privado compartido. Usar los factory methods. */
  private SaleItem(UUID tenantId, UUID saleId, ItemType type, UUID refId,
                   String name, int quantity, BigDecimal unitPrice, BigDecimal taxRate) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.saleId = saleId;
    this.itemType = type;
    if (type == ItemType.PRODUCT) this.productId = refId;
    else this.serviceId = refId;
    this.productName = name;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.taxRate = taxRate == null ? BigDecimal.ZERO : taxRate;
    this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    this.taxAmount = this.subtotal.multiply(this.taxRate)
        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    this.total = this.subtotal.add(this.taxAmount);
    this.createdAt = OffsetDateTime.now();
  }

  public static SaleItem forProduct(UUID tenantId, UUID saleId, UUID productId,
                                    String productName, int quantity,
                                    BigDecimal unitPrice, BigDecimal taxRate) {
    return new SaleItem(tenantId, saleId, ItemType.PRODUCT, productId,
        productName, quantity, unitPrice, taxRate);
  }

  public static SaleItem forService(UUID tenantId, UUID saleId, UUID serviceId,
                                    String serviceName, BigDecimal unitPrice,
                                    BigDecimal taxRate) {
    // Un servicio siempre es quantity = 1
    return new SaleItem(tenantId, saleId, ItemType.SERVICE, serviceId,
        serviceName, 1, unitPrice, taxRate);
  }

  // Retro-compatibilidad con SaleService.createSale (4 args públicos previos)
  public SaleItem(UUID tenantId, UUID saleId, UUID productId, String productName,
                  int quantity, BigDecimal unitPrice, BigDecimal taxRate) {
    this(tenantId, saleId, ItemType.PRODUCT, productId,
        productName, quantity, unitPrice, taxRate);
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getSaleId() { return saleId; }
  public UUID getProductId() { return productId; }
  public UUID getServiceId() { return serviceId; }
  public ItemType getItemType() { return itemType; }
  public String getProductName() { return productName; }
  public int getQuantity() { return quantity; }
  public BigDecimal getUnitPrice() { return unitPrice; }
  public BigDecimal getTaxRate() { return taxRate; }
  public BigDecimal getSubtotal() { return subtotal; }
  public BigDecimal getTaxAmount() { return taxAmount; }
  public BigDecimal getTotal() { return total; }
}
