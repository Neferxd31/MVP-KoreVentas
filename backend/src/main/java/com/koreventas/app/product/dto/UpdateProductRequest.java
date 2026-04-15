package com.koreventas.app.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateProductRequest(
    @Size(max = 200) String name,
    String description,
    @Size(max = 100) String barcode,
    @DecimalMin("0") BigDecimal price,
    @DecimalMin("0") BigDecimal cost,
    @DecimalMin("0") BigDecimal taxRate,
    @Min(0) Integer stock,
    @Min(0) Integer stockAlert,
    String imageUrl,
    Boolean favorite,
    Boolean active,
    UUID categoryId
) {}
