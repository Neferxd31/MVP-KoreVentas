package com.koreventas.app.expense;

import com.koreventas.app.expense.dto.CreateExpenseRequest;
import com.koreventas.app.expense.dto.ExpenseCategoryResponse;
import com.koreventas.app.expense.dto.ExpenseResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

  private final ExpenseService service;

  public ExpenseController(ExpenseService service) {
    this.service = service;
  }

  @GetMapping
  public List<ExpenseResponse> list(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    return service.findInRange(from, to).stream().map(ExpenseResponse::from).toList();
  }

  @GetMapping("/summary")
  public Map<String, Object> summary(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    BigDecimal total = service.sumInRange(from, to);
    List<Object[]> byCat = service.sumByCategory(from, to);
    List<Map<String, Object>> breakdown = byCat.stream()
        .map(row -> {
          Map<String, Object> m = new HashMap<>();
          m.put("categoryId", row[0]);
          m.put("amount", row[1]);
          return m;
        })
        .toList();
    return Map.of("total", total, "byCategory", breakdown);
  }

  @PostMapping
  public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody CreateExpenseRequest req) {
    Expense e = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(ExpenseResponse.from(e));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Gasto eliminado"));
  }

  // ── Categorías ──────────────────────────────────────────

  @GetMapping("/categories")
  public List<ExpenseCategoryResponse> listCategories() {
    return service.findAllCategories().stream()
        .map(ExpenseCategoryResponse::from).toList();
  }

  @PostMapping("/categories")
  public ResponseEntity<ExpenseCategoryResponse> createCategory(@RequestBody Map<String, String> body) {
    String name = body.get("name");
    String color = body.get("color");
    if (name == null || name.isBlank()) {
      return ResponseEntity.badRequest().build();
    }
    ExpenseCategory cat = service.createCategory(name, color);
    return ResponseEntity.status(HttpStatus.CREATED).body(ExpenseCategoryResponse.from(cat));
  }
}
