package com.koreventas.app.product.dto;

import com.koreventas.app.product.Product;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    UUID categoryId,
    String name,
    String description,
    String barcode,
    BigDecimal price,
    BigDecimal cost,
    BigDecimal taxRate,
    int stock,
    int stockAlert,
    boolean lowStock,
    String imageUrl,
    boolean favorite,
    boolean active,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
  public static ProductResponse from(Product p) {
    return new ProductResponse(
        p.getId(),
        p.getCategoryId(),
        p.getName(),
        p.getDescription(),
        p.getBarcode(),
        p.getPrice(),
        p.getCost(),
        p.getTaxRate(),
        p.getStock(),
        p.getStockAlert(),
        p.isLowStock(),
        p.getImageUrl(),
        p.isFavorite(),
        p.isActive(),
        p.getCreatedAt(),
        p.getUpdatedAt()
    );
  }
}
