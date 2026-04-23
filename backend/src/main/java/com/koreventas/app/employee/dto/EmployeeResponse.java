package com.koreventas.app.employee.dto;

import com.koreventas.app.employee.Employee;

import java.util.UUID;

public record EmployeeResponse(
    UUID id,
    String fullName,
    String role,
    String phone,
    String color,
    boolean active
) {
  public static EmployeeResponse from(Employee e) {
    return new EmployeeResponse(
        e.getId(),
        e.getFullName(),
        e.getRole(),
        e.getPhone(),
        e.getColor(),
        e.isActive()
    );
  }
}
