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
    String customColor,
    // Catálogo público
    @Size(max = 30) String whatsappPhone,
    @Pattern(regexp = "^[a-z0-9-]{3,80}$", message = "Slug solo permite minúsculas, números y guiones")
    String publicSlug,
    Boolean catalogEnabled
) {}
