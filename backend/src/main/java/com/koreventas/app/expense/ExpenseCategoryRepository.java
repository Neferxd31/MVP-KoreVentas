package com.koreventas.app.expense;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {
  List<ExpenseCategory> findAllByOrderByNameAsc();
}
