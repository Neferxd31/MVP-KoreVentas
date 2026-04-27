package com.koreventas.app.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

  @Query("SELECT e FROM Expense e WHERE e.expenseDate >= :from AND e.expenseDate <= :to "
      + "ORDER BY e.expenseDate DESC, e.createdAt DESC")
  List<Expense> findInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

  @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e "
      + "WHERE e.expenseDate >= :from AND e.expenseDate <= :to")
  BigDecimal sumInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

  @Query("SELECT e.categoryId, COALESCE(SUM(e.amount), 0) FROM Expense e "
      + "WHERE e.expenseDate >= :from AND e.expenseDate <= :to "
      + "GROUP BY e.categoryId")
  List<Object[]> sumByCategory(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
