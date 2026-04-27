package com.koreventas.app.goal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record UpsertGoalRequest(
    @NotNull @Min(2020) Integer year,
    @NotNull @Min(1) Integer month,
    @NotNull @PositiveOrZero BigDecimal revenueTarget,
    @NotNull @PositiveOrZero Integer ordersTarget
) {}
