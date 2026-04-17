package com.koreventas.app.sale.dto;

import java.math.BigDecimal;

public record DashboardResumenDTO(
    BigDecimal ventasDia,
    BigDecimal ventasMes,
    BigDecimal ventasTotales,
    Long ordenesHoy
) {}