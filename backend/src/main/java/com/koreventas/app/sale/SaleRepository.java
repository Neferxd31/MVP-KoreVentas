package com.koreventas.app.sale;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

  @Query("SELECT s FROM Sale s WHERE s.customerId = :customerId AND s.tenantId = :tenantId")
  List<Sale> findByCustomerIdAndTenantId(@Param("customerId") UUID customerId, @Param("tenantId") UUID tenantId);


  @Query("SELECT s FROM Sale s WHERE s.tenantId = :tenantId AND s.createdAt >= :from AND s.createdAt < :to AND s.status = 'COMPLETADA' ORDER BY s.createdAt DESC")
  List<Sale> findByDateRangeAndTenantId(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

  @Query("SELECT COUNT(s) FROM Sale s WHERE s.tenantId = :tenantId AND s.createdAt >= :from AND s.status = 'COMPLETADA'")
  long countSinceByTenantId(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from);

  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.tenantId = :tenantId AND s.createdAt >= :from AND s.status = 'COMPLETADA'")
  BigDecimal totalSinceByTenantId(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from);

  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.tenantId = :tenantId AND s.status = 'COMPLETADA'")
  BigDecimal sumTotalSalesByTenant(@Param("tenantId") UUID tenantId);

  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.tenantId = :tenantId AND s.status = 'COMPLETADA' AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
  BigDecimal sumSalesByTenantAndDateRange(
          @Param("tenantId") UUID tenantId,
          @Param("startDate") OffsetDateTime startDate,
          @Param("endDate") OffsetDateTime endDate);

  @Query("SELECT COUNT(s) FROM Sale s WHERE s.tenantId = :tenantId AND s.status = 'COMPLETADA' AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
  long countSalesByTenantAndDateRange(
          @Param("tenantId") UUID tenantId,
          @Param("startDate") OffsetDateTime startDate,
          @Param("endDate") OffsetDateTime endDate);

  /** Total en efectivo entre dos timestamps (para arqueo de caja). */
  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.paymentMethod = 'EFECTIVO' "
      + "AND s.status = 'COMPLETADA' AND s.createdAt >= :from AND s.createdAt <= :to")
  BigDecimal sumCashBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

  // ── Reportes ────────────────────────────────────────────────────────

  /** Ventas agrupadas por día (para line chart). Devuelve [date, total, count]. */
  @Query(value = "SELECT DATE(created_at) AS d, "
      + "COALESCE(SUM(total), 0) AS t, COUNT(*) AS c "
      + "FROM sales WHERE status = 'COMPLETADA' "
      + "AND created_at >= :from AND created_at <= :to "
      + "GROUP BY DATE(created_at) ORDER BY DATE(created_at)",
      nativeQuery = true)
  List<Object[]> salesByDay(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

  /** Totales por método de pago en rango. */
  @Query("SELECT s.paymentMethod, COALESCE(SUM(s.total), 0), COUNT(s) FROM Sale s "
      + "WHERE s.status = 'COMPLETADA' AND s.createdAt >= :from AND s.createdAt <= :to "
      + "GROUP BY s.paymentMethod")
  List<Object[]> salesByPaymentMethod(@Param("from") OffsetDateTime from,
                                      @Param("to") OffsetDateTime to);

  // ── Historial de ventas con filtros opcionales ────────────────────────────
  // Cualquier parámetro nullo se ignora (con COALESCE/IS NULL OR).

  @Query("SELECT DISTINCT s FROM Sale s LEFT JOIN s.items i "
      + "WHERE s.createdAt >= :from AND s.createdAt <= :to "
      + "AND (:customerId IS NULL OR s.customerId = :customerId) "
      + "AND (:paymentMethod IS NULL OR s.paymentMethod = :paymentMethod) "
      + "AND (:productId IS NULL OR i.productId = :productId) "
      + "AND (:serviceId IS NULL OR i.serviceId = :serviceId) "
      + "ORDER BY s.createdAt DESC")
  List<Sale> searchSales(@Param("from") OffsetDateTime from,
                         @Param("to") OffsetDateTime to,
                         @Param("customerId") UUID customerId,
                         @Param("paymentMethod") PaymentMethod paymentMethod,
                         @Param("productId") UUID productId,
                         @Param("serviceId") UUID serviceId);
}
