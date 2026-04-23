package com.koreventas.app.expense.dto;

import com.koreventas.app.expense.ExpenseCategory;

import java.util.UUID;

public record ExpenseCategoryResponse(UUID id, String name, String color) {
  public static ExpenseCategoryResponse from(ExpenseCategory c) {
    return new ExpenseCategoryResponse(c.getId(), c.getName(), c.getColor());
  }
}
