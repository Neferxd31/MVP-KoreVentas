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
    return from(p, true);
  }

  /**
   * Versión que oculta el costo si el caller no debería verlo (rol SELLER).
   * El costo es información sensible que solo el ADMIN del negocio debe ver.
   */
  public static ProductResponse from(Product p, boolean includeCost) {
    return new ProductResponse(
        p.getId(),
        p.getCategoryId(),
        p.getName(),
        p.getDescription(),
        p.getBarcode(),
        p.getPrice(),
        includeCost ? p.getCost() : null,
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
