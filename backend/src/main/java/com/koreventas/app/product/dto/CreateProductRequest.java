package com.koreventas.app.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateProductRequest(
    @NotBlank @Size(max = 200) String name,
    String description,
    @Size(max = 100) String barcode,
    @NotNull @DecimalMin("0") BigDecimal price,
    @DecimalMin("0") BigDecimal cost,
    @NotNull @DecimalMin("0") BigDecimal taxRate,
    @Min(0) int stock,
    @Min(0) int stockAlert,
    String imageUrl,
    boolean favorite,
    UUID categoryId
) {}
