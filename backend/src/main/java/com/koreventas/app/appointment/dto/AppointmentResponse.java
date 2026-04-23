package com.koreventas.app.appointment.dto;

import com.koreventas.app.appointment.Appointment;
import com.koreventas.app.appointment.AppointmentStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentResponse(
    UUID id,
    UUID serviceId,
    String serviceName,
    UUID employeeId,
    UUID customerId,
    String customerName,
    String customerPhone,
    OffsetDateTime startAt,
    OffsetDateTime endAt,
    int durationMinutes,
    BigDecimal price,
    AppointmentStatus status,
    String notes,
    UUID saleId
) {
  public static AppointmentResponse from(Appointment a) {
    return new AppointmentResponse(
        a.getId(),
        a.getServiceId(),
        a.getServiceName(),
        a.getEmployeeId(),
        a.getCustomerId(),
        a.getCustomerName(),
        a.getCustomerPhone(),
        a.getStartAt(),
        a.getEndAt(),
        a.getDurationMinutes(),
        a.getPrice(),
        a.getStatus(),
        a.getNotes(),
        a.getSaleId()
    );
  }
}
