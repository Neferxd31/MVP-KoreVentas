package com.koreventas.app.customer.dto;

import com.koreventas.app.customer.Customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CustomerResponse(
    UUID id,
    String fullName,
    String phone,
    String email,
    String notes,
    LocalDate birthday,
    String autoTag,
    List<String> manualTags,
    int totalPurchases,
    BigDecimal totalSpent,
    BigDecimal avgTicket,
    OffsetDateTime lastVisitAt,
    long daysSinceLastVisit,
    BigDecimal avgDaysBetweenVisits,
    OffsetDateTime createdAt
) {
  public static CustomerResponse from(Customer c) {
    return new CustomerResponse(
        c.getId(),
        c.getFullName(),
        c.getPhone(),
        c.getEmail(),
        c.getNotes(),
        c.getBirthday(),
        c.getAutoTag().name(),
        c.getManualTags(),
        c.getTotalPurchases(),
        c.getTotalSpent(),
        c.getAvgTicket(),
        c.getLastVisitAt(),
        c.daysSinceLastVisit(),
        c.getAvgDaysBetweenVisits(),
        c.getCreatedAt()
    );
  }
}
