package com.koreventas.app.sale;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
  java.math.BigDecimal totalSinceByTenantId(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from);

  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.tenantId = :tenantId AND s.status = 'COMPLETADA'")
  java.math.BigDecimal sumTotalSalesByTenant(@Param("tenantId") UUID tenantId);

  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.tenantId = :tenantId AND s.status = 'COMPLETADA' AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
  java.math.BigDecimal sumSalesByTenantAndDateRange(
          @Param("tenantId") UUID tenantId, 
          @Param("startDate") OffsetDateTime startDate, 
          @Param("endDate") OffsetDateTime endDate);

  @Query("SELECT COUNT(s) FROM Sale s WHERE s.tenantId = :tenantId AND s.status = 'COMPLETADA' AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
  long countSalesByTenantAndDateRange(
          @Param("tenantId") UUID tenantId, 
          @Param("startDate") OffsetDateTime startDate, 
          @Param("endDate") OffsetDateTime endDate);
}