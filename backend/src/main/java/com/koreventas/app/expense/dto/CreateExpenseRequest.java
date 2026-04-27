package com.koreventas.app.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateExpenseRequest(
    @NotBlank String description,
    @NotNull @PositiveOrZero BigDecimal amount,
    UUID categoryId,
    String paymentMethod,
    LocalDate expenseDate,
    String notes
) {}
