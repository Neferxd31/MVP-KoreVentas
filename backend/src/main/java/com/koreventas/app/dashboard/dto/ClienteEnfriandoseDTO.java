package com.koreventas.app.dashboard.dto;

import java.util.UUID;

public record ClienteEnfriandoseDTO(
    UUID id,
    String fullName,
    String phone,
    long diasSinVisita
) {}
