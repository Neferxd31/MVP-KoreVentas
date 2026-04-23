package com.koreventas.app.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

  List<Employee> findByActiveTrue();

  @Query("SELECT e FROM Employee e WHERE e.active = true ORDER BY e.fullName ASC")
  List<Employee> findAllActiveOrdered();
}
