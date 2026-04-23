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
    String customerPhone,  // Vinculación automática por teléfono (RF-06)
    String notes,
    @NotEmpty @Valid List<ItemRequest> items
) {
  /**
   * Un ítem puede ser PRODUCT o SERVICE. Exactamente uno de los dos IDs
   * debe venir poblado. Se valida en SaleService.
   */
  public record ItemRequest(
      UUID productId,      // nullable si itemType=SERVICE
      UUID serviceId,      // nullable si itemType=PRODUCT
      @Min(1) int quantity
  ) {
    public boolean isService() { return serviceId != null; }
    public boolean isProduct() { return productId != null; }
  }
}
