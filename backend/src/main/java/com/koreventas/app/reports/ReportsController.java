package com.koreventas.app.reports;

import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Reportes agregados para el dashboard de análisis.
 * Todo bajo RLS: el SET LOCAL filtra por tenant.
 */
@RestController
@RequestMapping("/reports")
public class ReportsController {

  @PersistenceContext
  private EntityManager em;

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  private OffsetDateTime atStart(LocalDate d) {
    return d.atStartOfDay().atOffset(ZoneOffset.UTC);
  }

  private OffsetDateTime atEnd(LocalDate d) {
    return d.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
  }

  /** Resumen ejecutivo: ingresos, gastos, ganancia neta, #ventas, ticket promedio. */
  @GetMapping("/overview")
  @Transactional(readOnly = true)
  public Map<String, Object> overview(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    applyTenant();

    OffsetDateTime fromTs = atStart(from);
    OffsetDateTime toTs = atEnd(to);

    Object[] salesRow = (Object[]) em.createNativeQuery(
        "SELECT COALESCE(SUM(total), 0), COUNT(*) FROM sales "
            + "WHERE status = 'COMPLETADA' AND created_at >= ?1 AND created_at < ?2")
        .setParameter(1, fromTs).setParameter(2, toTs)
        .getSingleResult();

    BigDecimal revenue = toBD(salesRow[0]);
    long orderCount = ((Number) salesRow[1]).longValue();
    BigDecimal avgTicket = orderCount == 0
        ? BigDecimal.ZERO
        : revenue.divide(BigDecimal.valueOf(orderCount), 2, java.math.RoundingMode.HALF_UP);

    BigDecimal expenses = toBD(em.createNativeQuery(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses "
            + "WHERE expense_date >= ?1 AND expense_date <= ?2")
        .setParameter(1, from).setParameter(2, to)
        .getSingleResult());

    BigDecimal netProfit = revenue.subtract(expenses);

    Map<String, Object> result = new HashMap<>();
    result.put("revenue", revenue);
    result.put("expenses", expenses);
    result.put("netProfit", netProfit);
    result.put("orderCount", orderCount);
    result.put("averageTicket", avgTicket);
    return result;
  }

  /** Serie temporal de ventas por día. */
  @GetMapping("/sales-by-day")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> salesByDay(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT DATE(created_at) AS d, COALESCE(SUM(total), 0), COUNT(*) "
            + "FROM sales WHERE status = 'COMPLETADA' "
            + "AND created_at >= ?1 AND created_at < ?2 "
            + "GROUP BY DATE(created_at) ORDER BY DATE(created_at)")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      m.put("date", ((Date) r[0]).toLocalDate().toString());
      m.put("total", toBD(r[1]));
      m.put("count", ((Number) r[2]).longValue());
      return m;
    }).toList();
  }

  /** Top productos por unidades vendidas y por ingreso. */
  @GetMapping("/top-products")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> topProducts(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(defaultValue = "10") int limit) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT si.product_id, si.product_name, "
            + "SUM(si.quantity), SUM(si.total) "
            + "FROM sale_items si "
            + "JOIN sales s ON s.id = si.sale_id "
            + "WHERE si.item_type = 'PRODUCT' AND s.status = 'COMPLETADA' "
            + "AND s.created_at >= ?1 AND s.created_at < ?2 "
            + "GROUP BY si.product_id, si.product_name "
            + "ORDER BY SUM(si.total) DESC LIMIT ?3")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .setParameter(3, limit)
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      m.put("productId", r[0]);
      m.put("name", r[1]);
      m.put("quantity", ((Number) r[2]).longValue());
      m.put("revenue", toBD(r[3]));
      return m;
    }).toList();
  }

  /** Top servicios por cantidad y por ingreso. */
  @GetMapping("/top-services")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> topServices(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(defaultValue = "10") int limit) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT si.service_id, si.product_name, "
            + "COUNT(*), SUM(si.total) "
            + "FROM sale_items si "
            + "JOIN sales s ON s.id = si.sale_id "
            + "WHERE si.item_type = 'SERVICE' AND s.status = 'COMPLETADA' "
            + "AND s.created_at >= ?1 AND s.created_at < ?2 "
            + "GROUP BY si.service_id, si.product_name "
            + "ORDER BY SUM(si.total) DESC LIMIT ?3")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .setParameter(3, limit)
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      m.put("serviceId", r[0]);
      m.put("name", r[1]);
      m.put("count", ((Number) r[2]).longValue());
      m.put("revenue", toBD(r[3]));
      return m;
    }).toList();
  }

  /** Top clientes por gasto en el rango. */
  @GetMapping("/top-customers")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> topCustomers(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(defaultValue = "10") int limit) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT s.customer_id, c.full_name, c.phone, "
            + "COUNT(*), SUM(s.total) "
            + "FROM sales s JOIN customers c ON c.id = s.customer_id "
            + "WHERE s.status = 'COMPLETADA' "
            + "AND s.created_at >= ?1 AND s.created_at < ?2 "
            + "GROUP BY s.customer_id, c.full_name, c.phone "
            + "ORDER BY SUM(s.total) DESC LIMIT ?3")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .setParameter(3, limit)
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      m.put("customerId", r[0]);
      m.put("name", r[1]);
      m.put("phone", r[2]);
      m.put("orderCount", ((Number) r[3]).longValue());
      m.put("totalSpent", toBD(r[4]));
      return m;
    }).toList();
  }

  /** Ventas por método de pago (para pie chart). */
  @GetMapping("/by-payment")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> byPayment(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT payment_method, COALESCE(SUM(total), 0), COUNT(*) FROM sales "
            + "WHERE status = 'COMPLETADA' AND created_at >= ?1 AND created_at < ?2 "
            + "GROUP BY payment_method ORDER BY SUM(total) DESC")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      m.put("paymentMethod", r[0]);
      m.put("total", toBD(r[1]));
      m.put("count", ((Number) r[2]).longValue());
      return m;
    }).toList();
  }

  /** Desempeño por empleado (citas completadas). */
  @GetMapping("/employee-performance")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> employeePerformance(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT a.employee_id, e.full_name, e.color, "
            + "COUNT(*) FILTER (WHERE a.status = 'COMPLETADA'), "
            + "COUNT(*) FILTER (WHERE a.status = 'CANCELADA'), "
            + "COUNT(*) FILTER (WHERE a.status = 'NO_ASISTIO'), "
            + "COALESCE(SUM(a.price) FILTER (WHERE a.status = 'COMPLETADA'), 0) "
            + "FROM appointments a "
            + "LEFT JOIN employees e ON e.id = a.employee_id "
            + "WHERE a.start_at >= ?1 AND a.start_at < ?2 "
            + "AND a.employee_id IS NOT NULL "
            + "GROUP BY a.employee_id, e.full_name, e.color "
            + "ORDER BY COUNT(*) FILTER (WHERE a.status = 'COMPLETADA') DESC")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      m.put("employeeId", r[0]);
      m.put("name", r[1]);
      m.put("color", r[2]);
      m.put("completed", ((Number) r[3]).longValue());
      m.put("cancelled", ((Number) r[4]).longValue());
      m.put("noShow", ((Number) r[5]).longValue());
      m.put("revenue", toBD(r[6]));
      return m;
    }).toList();
  }

  /** Heatmap de ocupación de agenda: [dayOfWeek 0-6, hour 0-23, count]. */
  @GetMapping("/agenda-heatmap")
  @Transactional(readOnly = true)
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> agendaHeatmap(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    applyTenant();

    List<Object[]> rows = em.createNativeQuery(
        "SELECT EXTRACT(DOW FROM start_at)::int, "
            + "EXTRACT(HOUR FROM start_at)::int, COUNT(*) "
            + "FROM appointments WHERE start_at >= ?1 AND start_at < ?2 "
            + "GROUP BY 1, 2 ORDER BY 1, 2")
        .setParameter(1, atStart(from)).setParameter(2, atEnd(to))
        .getResultList();

    return rows.stream().map(r -> {
      Map<String, Object> m = new HashMap<>();
      // Postgres DOW: 0=Sunday, 1=Monday... lo pasamos a 0=Lun..6=Dom en el front
      m.put("dayOfWeek", ((Number) r[0]).intValue());
      m.put("hour", ((Number) r[1]).intValue());
      m.put("count", ((Number) r[2]).longValue());
      return m;
    }).toList();
  }

  private BigDecimal toBD(Object o) {
    if (o == null) return BigDecimal.ZERO;
    if (o instanceof BigDecimal bd) return bd;
    if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
    return new BigDecimal(o.toString());
  }
}
