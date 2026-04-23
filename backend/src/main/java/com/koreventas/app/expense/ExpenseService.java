package com.koreventas.app.expense;

import com.koreventas.app.expense.dto.CreateExpenseRequest;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {

  private final ExpenseRepository expenses;
  private final ExpenseCategoryRepository categories;

  @PersistenceContext
  private EntityManager em;

  public ExpenseService(ExpenseRepository expenses, ExpenseCategoryRepository categories) {
    this.expenses = expenses;
    this.categories = categories;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public List<Expense> findInRange(LocalDate from, LocalDate to) {
    applyTenant();
    return expenses.findInRange(from, to);
  }

  @Transactional(readOnly = true)
  public BigDecimal sumInRange(LocalDate from, LocalDate to) {
    applyTenant();
    return expenses.sumInRange(from, to);
  }

  @Transactional(readOnly = true)
  public List<Object[]> sumByCategory(LocalDate from, LocalDate to) {
    applyTenant();
    return expenses.sumByCategory(from, to);
  }

  @Transactional
  public Expense create(CreateExpenseRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();
    Expense e = new Expense(tenantId, req.description(), req.amount(), req.expenseDate());
    if (req.categoryId() != null) e.setCategoryId(req.categoryId());
    if (req.paymentMethod() != null && !req.paymentMethod().isBlank()) {
      e.setPaymentMethod(req.paymentMethod());
    }
    e.setNotes(req.notes());
    return expenses.save(e);
  }

  @Transactional
  public void delete(UUID id) {
    applyTenant();
    expenses.deleteById(id);
  }

  // ── Categorías ──────────────────────────────────────────

  @Transactional(readOnly = true)
  public List<ExpenseCategory> findAllCategories() {
    applyTenant();
    return categories.findAllByOrderByNameAsc();
  }

  @Transactional
  public ExpenseCategory createCategory(String name, String color) {
    applyTenant();
    return categories.save(new ExpenseCategory(TenantContext.get(), name, color));
  }
}
