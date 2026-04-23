package com.koreventas.app.cash.dto;

import com.koreventas.app.cash.CashSession;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CashSessionResponse(
    UUID id,
    UUID openedBy,
    OffsetDateTime openedAt,
    OffsetDateTime closedAt,
    BigDecimal openingAmount,
    BigDecimal countedAmount,
    BigDecimal expectedAmount,
    BigDecimal difference,
    String status,
    String notes,
    // Calculado en tiempo real para sesión abierta
    BigDecimal currentExpected,
    BigDecimal cashSalesSoFar
) {
  public static CashSessionResponse from(CashSession s) {
    return new CashSessionResponse(
        s.getId(),
        s.getOpenedBy(),
        s.getOpenedAt(),
        s.getClosedAt(),
        s.getOpeningAmount(),
        s.getCountedAmount(),
        s.getExpectedAmount(),
        s.getDifference(),
        s.getStatus().name(),
        s.getNotes(),
        null,
        null
    );
  }

  public static CashSessionResponse withLive(CashSession s, BigDecimal cashSales) {
    BigDecimal expected = s.getOpeningAmount().add(cashSales);
    return new CashSessionResponse(
        s.getId(),
        s.getOpenedBy(),
        s.getOpenedAt(),
        s.getClosedAt(),
        s.getOpeningAmount(),
        s.getCountedAmount(),
        s.getExpectedAmount(),
        s.getDifference(),
        s.getStatus().name(),
        s.getNotes(),
        expected,
        cashSales
    );
  }
}
