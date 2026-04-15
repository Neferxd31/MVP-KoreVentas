package com.koreventas.app.sale.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateSaleRequest(
    @NotNull String paymentMethod,
    UUID customerId,
    String customerPhone,  // Para vinculación automática por teléfono (RF-06)
    String notes,
    @NotEmpty @Valid List<ItemRequest> items
) {
  public record ItemRequest(
      @NotNull UUID productId,
      @Min(1) int quantity
  ) {}
}
