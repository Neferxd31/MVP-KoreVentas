package com.koreventas.app.sale.dto;

import java.math.BigDecimal;

public record DashboardResumenDTO(
    BigDecimal ventasDia,
    BigDecimal ventasSemana,
    BigDecimal ventasMes,
    BigDecimal ventasTotales
    
) {}