package com.koreventas.app.sale;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales")
public class Sale {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "customer_id")
  private UUID customerId;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal subtotal;

  @Column(name = "tax_total", nullable = false, precision = 14, scale = 2)
  private BigDecimal taxTotal;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal total;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_method", nullable = false, length = 30)
  private PaymentMethod paymentMethod;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private SaleStatus status;

  private String notes;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @OneToMany(mappedBy = "saleId", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<SaleItem> items = new ArrayList<>();

  protected Sale() {}

  public Sale(UUID tenantId, PaymentMethod paymentMethod) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.paymentMethod = paymentMethod;
    this.status = SaleStatus.COMPLETADA;
    this.subtotal = BigDecimal.ZERO;
    this.taxTotal = BigDecimal.ZERO;
    this.total = BigDecimal.ZERO;
    this.createdAt = OffsetDateTime.now();
  }

  public void addItem(SaleItem item) {
    this.items.add(item);
    this.subtotal = this.subtotal.add(item.getSubtotal());
    this.taxTotal = this.taxTotal.add(item.getTaxAmount());
    this.total = this.total.add(item.getTotal());
  }

  public void setCustomerId(UUID customerId) { this.customerId = customerId; }
  public void setNotes(String notes) { this.notes = notes; }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public UUID getCustomerId() { return customerId; }
  public BigDecimal getSubtotal() { return subtotal; }
  public BigDecimal getTaxTotal() { return taxTotal; }
  public BigDecimal getTotal() { return total; }
  public PaymentMethod getPaymentMethod() { return paymentMethod; }
  public SaleStatus getStatus() { return status; }
  public String getNotes() { return notes; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public List<SaleItem> getItems() { return items; }
}
