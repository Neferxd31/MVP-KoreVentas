package com.koreventas.app.customer.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UpdateCustomerRequest(
    @Size(max = 150) String fullName,
    @Size(max = 30) String phone,
    @Size(max = 180) String email,
    String notes,
    LocalDate birthday,
    List<String> manualTags
) {}
