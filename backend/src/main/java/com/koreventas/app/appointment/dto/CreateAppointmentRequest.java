package com.koreventas.app.appointment.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateAppointmentRequest(
    @NotNull UUID serviceId,
    UUID employeeId,
    UUID customerId,
    String customerName,
    String customerPhone,
    @NotNull OffsetDateTime startAt,
    String notes
) {}
