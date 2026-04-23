package com.koreventas.app.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ServiceRepository extends JpaRepository<Service, UUID> {

  List<Service> findByActiveTrue();

  @Query("SELECT s FROM Service s WHERE s.active = true ORDER BY s.name ASC")
  List<Service> findAllActiveOrdered();
}
