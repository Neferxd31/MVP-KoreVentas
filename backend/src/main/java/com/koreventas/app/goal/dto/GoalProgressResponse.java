package com.koreventas.app.goal.dto;

import java.math.BigDecimal;

/**
 * Snapshot del progreso de la meta del mes en curso.
 * Si no hay meta fijada todavía, los targets vienen en cero
 * y el frontend decide mostrar el llamado a fijar meta.
 */
public record GoalProgressResponse(
    int year,
    int month,
    BigDecimal revenueTarget,
    int ordersTarget,
    BigDecimal revenueSoFar,
    int ordersSoFar,
    // Día actual del mes / total días — para proyección lineal
    int dayOfMonth,
    int daysInMonth,
    BigDecimal projectedRevenue,
    boolean goalSet
) {}
