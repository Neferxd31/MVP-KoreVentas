package com.koreventas.app.appointment.dto;

import com.koreventas.app.appointment.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAppointmentStatusRequest(
    @NotNull AppointmentStatus status,
    // Solo aplica cuando status = COMPLETADA: método de pago para la venta que se creará
    String paymentMethod
) {}
