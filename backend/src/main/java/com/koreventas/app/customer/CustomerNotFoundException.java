package com.koreventas.app.customer;

import java.util.UUID;

public class CustomerNotFoundException extends RuntimeException {

  public CustomerNotFoundException(UUID id) {
    super("Cliente no encontrado: " + id);
  }

  public CustomerNotFoundException(String message) {
    super(message);
  }
}
