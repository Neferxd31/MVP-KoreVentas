package com.koreventas.app.cash.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record OpenCashSessionRequest(
    @NotNull @PositiveOrZero BigDecimal openingAmount
) {}
