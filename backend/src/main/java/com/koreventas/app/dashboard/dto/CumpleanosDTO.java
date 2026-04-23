package com.koreventas.app.dashboard.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CumpleanosDTO(
    UUID id,
    String fullName,
    String phone,
    LocalDate birthday
) {}
