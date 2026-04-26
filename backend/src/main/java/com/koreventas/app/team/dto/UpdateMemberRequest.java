package com.koreventas.app.team.dto;

import jakarta.validation.constraints.Pattern;

public record UpdateMemberRequest(
    @Pattern(regexp = "ADMIN|SELLER", message = "Rol inválido")
    String role,
    Boolean enabled
) {}
