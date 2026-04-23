package com.koreventas.app.customer;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

  Optional<Customer> findByPhone(String phone);

  List<Customer> findByAutoTag(CustomerTag tag);

  List<Customer> findByFullNameContainingIgnoreCase(String name);

  // Top N clientes inactivos ordenados por ticket gastado (más valiosos primero)
  @Query("SELECT c FROM Customer c WHERE c.autoTag = com.koreventas.app.customer.CustomerTag.INACTIVO "
      + "ORDER BY c.totalSpent DESC")
  List<Customer> findTopInactivos(Pageable pageable);

  long countByAutoTag(CustomerTag tag);

  // Cumpleaños dentro de un rango de DÍAS DEL AÑO (month-day)
  // Postgres: EXTRACT(DOY FROM ...) - usamos JPQL con function
  @Query(value = "SELECT * FROM customers c "
      + "WHERE c.birthday IS NOT NULL "
      + "AND to_char(c.birthday, 'MM-DD') BETWEEN :fromMmDd AND :toMmDd "
      + "ORDER BY to_char(c.birthday, 'MM-DD')", nativeQuery = true)
  List<Customer> findCumpleanosEntre(@Param("fromMmDd") String fromMmDd,
                                     @Param("toMmDd") String toMmDd);
}
