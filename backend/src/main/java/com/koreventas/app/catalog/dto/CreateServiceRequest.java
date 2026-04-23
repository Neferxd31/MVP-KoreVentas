package com.koreventas.app.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CreateServiceRequest(
    @NotBlank String name,
    String description,
    @NotNull @Min(1) Integer durationMinutes,
    @NotNull @PositiveOrZero BigDecimal price,
    BigDecimal taxRate,
    String color
) {}
