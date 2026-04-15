package com.koreventas.app.sale.dto;

import com.koreventas.app.sale.Sale;
import com.koreventas.app.sale.SaleItem;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record SaleResponse(
    UUID id,
    UUID customerId,
    BigDecimal subtotal,
    BigDecimal taxTotal,
    BigDecimal total,
    String paymentMethod,
    String status,
    String notes,
    OffsetDateTime createdAt,
    List<ItemResponse> items
) {
  public record ItemResponse(
      UUID id,
      UUID productId,
      String productName,
      int quantity,
      BigDecimal unitPrice,
      BigDecimal taxRate,
      BigDecimal subtotal,
      BigDecimal taxAmount,
      BigDecimal total
  ) {
    public static ItemResponse from(SaleItem i) {
      return new ItemResponse(
          i.getId(), i.getProductId(), i.getProductName(),
          i.getQuantity(), i.getUnitPrice(), i.getTaxRate(),
          i.getSubtotal(), i.getTaxAmount(), i.getTotal()
      );
    }
  }

  public static SaleResponse from(Sale s) {
    return new SaleResponse(
        s.getId(),
        s.getCustomerId(),
        s.getSubtotal(),
        s.getTaxTotal(),
        s.getTotal(),
        s.getPaymentMethod().name(),
        s.getStatus().name(),
        s.getNotes(),
        s.getCreatedAt(),
        s.getItems().stream().map(ItemResponse::from).toList()
    );
  }
}
