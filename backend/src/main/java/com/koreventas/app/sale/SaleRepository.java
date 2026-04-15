package com.koreventas.app.sale;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

  List<Sale> findByCustomerId(UUID customerId);

  @Query("SELECT s FROM Sale s WHERE s.createdAt >= :from AND s.createdAt < :to AND s.status = 'COMPLETADA' ORDER BY s.createdAt DESC")
  List<Sale> findByDateRange(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

  @Query("SELECT COUNT(s) FROM Sale s WHERE s.createdAt >= :from AND s.status = 'COMPLETADA'")
  long countSince(@Param("from") OffsetDateTime from);

  @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.createdAt >= :from AND s.status = 'COMPLETADA'")
  java.math.BigDecimal totalSince(@Param("from") OffsetDateTime from);
}
