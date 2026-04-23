package com.koreventas.app.dashboard.dto;

import java.util.UUID;

public record ProductoStockBajoDTO(
    UUID id,
    String name,
    int stock,
    int stockAlert
) {}
