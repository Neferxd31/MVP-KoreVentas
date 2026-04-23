package com.koreventas.app.catalog.dto;

import com.koreventas.app.catalog.Service;

import java.math.BigDecimal;
import java.util.UUID;

public record ServiceResponse(
    UUID id,
    String name,
    String description,
    int durationMinutes,
    BigDecimal price,
    BigDecimal taxRate,
    String color,
    boolean active
) {
  public static ServiceResponse from(Service s) {
    return new ServiceResponse(
        s.getId(),
        s.getName(),
        s.getDescription(),
        s.getDurationMinutes(),
        s.getPrice(),
        s.getTaxRate(),
        s.getColor(),
        s.isActive()
    );
  }
}
