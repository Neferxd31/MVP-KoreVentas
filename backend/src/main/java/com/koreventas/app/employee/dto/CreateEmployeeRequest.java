package com.koreventas.app.employee.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEmployeeRequest(
    @NotBlank String fullName,
    String role,
    String phone,
    String color
) {}
