package com.koreventas.app.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pulso del Negocio (RF-14):
 * Vista accionable. Cada bloque incluye señal + datos para tomar acción.
 */
public record PulsoDTO(
    // Comparativo de ventas: hoy vs ayer
    BigDecimal ventasHoy,
    BigDecimal ventasAyer,
    BigDecimal variacionVentasPct,   // % de cambio hoy vs ayer

    // Ticket promedio de la semana vs semana anterior
    BigDecimal ticketPromedioSemana,
    BigDecimal ticketPromedioSemanaAnterior,
    BigDecimal variacionTicketPct,

    long ordenesHoy,

    // Acciones sugeridas
    List<ClienteEnfriandoseDTO> clientesEnfriandose,
    int totalClientesInactivos,

    List<ProductoStockBajoDTO> productosStockBajo,
    int totalProductosStockBajo,

    List<CumpleanosDTO> cumpleanosSemana
) {}
