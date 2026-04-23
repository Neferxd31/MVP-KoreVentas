package com.koreventas.app.cash;

import com.koreventas.app.cash.dto.CashSessionResponse;
import com.koreventas.app.cash.dto.CloseCashSessionRequest;
import com.koreventas.app.cash.dto.OpenCashSessionRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cash-sessions")
public class CashSessionController {

  private final CashSessionService service;

  public CashSessionController(CashSessionService service) {
    this.service = service;
  }

  @GetMapping("/current")
  public ResponseEntity<CashSessionResponse> current() {
    return service.findOpen()
        .map(s -> {
          BigDecimal cashSales = service.cashSalesSinceOpen(s);
          return ResponseEntity.ok(CashSessionResponse.withLive(s, cashSales));
        })
        .orElseGet(() -> ResponseEntity.<CashSessionResponse>noContent().build());
  }

  @GetMapping
  public List<CashSessionResponse> list() {
    return service.findAll().stream().map(CashSessionResponse::from).toList();
  }

  @PostMapping("/open")
  public ResponseEntity<CashSessionResponse> open(@Valid @RequestBody OpenCashSessionRequest req) {
    UUID userId = currentUserId();
    CashSession s = service.open(req, userId);
    BigDecimal cashSales = service.cashSalesSinceOpen(s);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(CashSessionResponse.withLive(s, cashSales));
  }

  @PostMapping("/{id}/close")
  public CashSessionResponse close(@PathVariable UUID id,
                                   @Valid @RequestBody CloseCashSessionRequest req) {
    CashSession s = service.close(id, req);
    return CashSessionResponse.from(s);
  }

  private UUID currentUserId() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (principal instanceof UUID uuid) return uuid;
    if (principal instanceof String str) return UUID.fromString(str);
    return null;
  }
}
