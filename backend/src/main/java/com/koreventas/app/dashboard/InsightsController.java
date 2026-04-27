package com.koreventas.app.dashboard;

import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * "Qué vender hoy" — recomendaciones accionables generadas desde datos reales.
 * Tres pistas:
 *   1. champion   — el ítem (producto o servicio) que más ingresos generó en los últimos 7 días
 *   2. slowMover  — producto activo con stock alto y sin movimiento en 14 días
 *   3. bundle     — el par de productos que más se han vendido en la misma boleta
 */
@RestController
@RequestMapping("/dashboard")
public class InsightsController {

  @PersistenceContext
  private EntityManager em;

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @GetMapping("/insights")
  @Transactional(readOnly = true)
  public Map<String, Object> insights() {
    applyTenant();

    Map<String, Object> result = new HashMap<>();
    result.put("champion", findChampion());
    result.put("slowMover", findSlowMover());
    result.put("bundle", findBundle());
    return result;
  }

  /**
   * Top ítem (producto o servicio) por revenue en los últimos 7 días.
   * Devuelve null si no hubo ventas.
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> findChampion() {
    OffsetDateTime weekAgo = LocalDate.now().minusDays(7).atStartOfDay().atOffset(ZoneOffset.UTC);

    List<Object[]> rows = em.createNativeQuery(
        "SELECT si.item_type, "
            + "       COALESCE(si.product_id, si.service_id) AS item_id, "
            + "       si.product_name AS name, "
            + "       SUM(si.quantity) AS qty, "
            + "       SUM(si.subtotal) AS revenue "
            + "FROM sale_items si "
            + "JOIN sales s ON s.id = si.sale_id "
            + "WHERE s.status = 'COMPLETADA' AND s.created_at >= ?1 "
            + "GROUP BY si.item_type, item_id, si.product_name "
            + "ORDER BY revenue DESC LIMIT 1")
        .setParameter(1, weekAgo)
        .getResultList();

    if (rows.isEmpty()) return null;
    Object[] r = rows.get(0);
    Map<String, Object> m = new HashMap<>();
    m.put("itemType", (String) r[0]);
    m.put("itemId", r[1] != null ? r[1].toString() : null);
    m.put("name", (String) r[2]);
    m.put("quantity", ((Number) r[3]).longValue());
    m.put("revenue", toBD(r[4]));
    return m;
  }

  /**
   * Producto activo con stock >= 5 y 0 ventas en los últimos 14 días.
   * Prioriza el de más stock para empujar primero el más "atascado".
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> findSlowMover() {
    OffsetDateTime twoWeeksAgo = LocalDate.now().minusDays(14).atStartOfDay().atOffset(ZoneOffset.UTC);

    List<Object[]> rows = em.createNativeQuery(
        "SELECT p.id, p.name, p.stock, p.price, p.cost "
            + "FROM products p "
            + "WHERE p.active = true AND p.stock >= 5 "
            + "  AND NOT EXISTS ( "
            + "    SELECT 1 FROM sale_items si "
            + "    JOIN sales s ON s.id = si.sale_id "
            + "    WHERE si.product_id = p.id "
            + "      AND s.status = 'COMPLETADA' "
            + "      AND s.created_at >= ?1 "
            + "  ) "
            + "ORDER BY p.stock DESC LIMIT 1")
        .setParameter(1, twoWeeksAgo)
        .getResultList();

    if (rows.isEmpty()) return null;
    Object[] r = rows.get(0);
    Map<String, Object> m = new HashMap<>();
    m.put("id", r[0].toString());
    m.put("name", (String) r[1]);
    m.put("stock", ((Number) r[2]).intValue());
    m.put("price", toBD(r[3]));
    m.put("cost", r[4] == null ? null : toBD(r[4]));
    return m;
  }

  /**
   * Par de productos más vendidos juntos (en la misma boleta).
   * Self-join sobre sale_items con id1 < id2 para evitar duplicados.
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> findBundle() {
    List<Object[]> rows = em.createNativeQuery(
        "SELECT a.product_name AS n1, b.product_name AS n2, COUNT(*) AS together "
            + "FROM sale_items a "
            + "JOIN sale_items b ON a.sale_id = b.sale_id "
            + " AND a.product_id IS NOT NULL AND b.product_id IS NOT NULL "
            + " AND a.product_id < b.product_id "
            + "GROUP BY a.product_name, b.product_name "
            + "HAVING COUNT(*) >= 2 "
            + "ORDER BY together DESC LIMIT 1")
        .getResultList();

    if (rows.isEmpty()) return null;
    Object[] r = rows.get(0);
    Map<String, Object> m = new HashMap<>();
    m.put("first", (String) r[0]);
    m.put("second", (String) r[1]);
    m.put("timesTogether", ((Number) r[2]).longValue());
    return m;
  }

  /**
   * Estado del onboarding: qué pasos ha completado el tenant.
   * El frontend pinta una checklist con esto y se autoclava cuando todo está hecho.
   */
  @GetMapping("/onboarding")
  @Transactional(readOnly = true)
  public Map<String, Object> onboarding() {
    applyTenant();

    long products = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM products WHERE active = true").getSingleResult()).longValue();
    long services = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM services WHERE active = true").getSingleResult()).longValue();
    long customers = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM customers").getSingleResult()).longValue();
    long sales = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM sales WHERE status = 'COMPLETADA'").getSingleResult()).longValue();
    long cashSessions = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM cash_sessions").getSingleResult()).longValue();
    long goals = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM monthly_goals").getSingleResult()).longValue();
    long productsWithCost = ((Number) em.createNativeQuery(
        "SELECT COUNT(*) FROM products WHERE active = true AND cost IS NOT NULL AND cost > 0")
        .getSingleResult()).longValue();

    Map<String, Object> result = new HashMap<>();
    result.put("hasCatalog", products > 0 || services > 0);
    result.put("hasCustomer", customers > 0);
    result.put("hasFirstSale", sales > 0);
    result.put("hasCashSession", cashSessions > 0);
    result.put("hasGoal", goals > 0);
    result.put("hasCostsDefined", productsWithCost >= 3);

    int total = 6;
    int done = 0;
    if (products > 0 || services > 0) done++;
    if (customers > 0) done++;
    if (sales > 0) done++;
    if (cashSessions > 0) done++;
    if (goals > 0) done++;
    if (productsWithCost >= 3) done++;

    result.put("totalSteps", total);
    result.put("completedSteps", done);
    result.put("isComplete", done == total);
    return result;
  }

  private BigDecimal toBD(Object o) {
    if (o == null) return BigDecimal.ZERO;
    if (o instanceof BigDecimal bd) return bd;
    if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
    return new BigDecimal(o.toString());
  }
}
