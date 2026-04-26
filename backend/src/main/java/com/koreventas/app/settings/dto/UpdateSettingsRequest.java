package com.koreventas.app.settings.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateSettingsRequest(
    @Size(max = 150) String businessName,
    String logoUrl,
    @Pattern(regexp = "indigo|teal|rose|amber|emerald|slate|custom",
        message = "Paleta inválida")
    String primaryColor,
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color hex inválido")
    String customColor
) {}
