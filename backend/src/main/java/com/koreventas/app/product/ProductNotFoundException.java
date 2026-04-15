package com.koreventas.app.product;

import java.util.UUID;

public class ProductNotFoundException extends RuntimeException {

  public ProductNotFoundException(UUID id) {
    super("Producto no encontrado: " + id);
  }

  public ProductNotFoundException(String message) {
    super(message);
  }
}
