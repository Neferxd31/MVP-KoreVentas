package com.koreventas.app.expense.dto;

import com.koreventas.app.expense.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseResponse(
    UUID id,
    UUID categoryId,
    String description,
    BigDecimal amount,
    String paymentMethod,
    LocalDate expenseDate,
    String notes
) {
  public static ExpenseResponse from(Expense e) {
    return new ExpenseResponse(
        e.getId(),
        e.getCategoryId(),
        e.getDescription(),
        e.getAmount(),
        e.getPaymentMethod(),
        e.getExpenseDate(),
        e.getNotes()
    );
  }
}
