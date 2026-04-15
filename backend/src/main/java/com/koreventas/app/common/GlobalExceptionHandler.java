package com.koreventas.app.common;

import com.koreventas.app.customer.CustomerNotFoundException;
import com.koreventas.app.product.ProductNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler({ProductNotFoundException.class, CustomerNotFoundException.class})
  public ResponseEntity<Map<String, Object>> handleNotFound(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
        "error", "NOT_FOUND",
        "message", ex.getMessage(),
        "timestamp", Instant.now().toString()
    ));
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<Map<String, Object>> handleBadState(IllegalStateException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
        "error", "CONFLICT",
        "message", ex.getMessage(),
        "timestamp", Instant.now().toString()
    ));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    var errors = ex.getBindingResult().getFieldErrors().stream()
        .map(e -> Map.of("field", e.getField(), "message", e.getDefaultMessage()))
        .toList();
    return ResponseEntity.badRequest().body(Map.of(
        "error", "VALIDATION_ERROR",
        "details", errors,
        "timestamp", Instant.now().toString()
    ));
  }
}
