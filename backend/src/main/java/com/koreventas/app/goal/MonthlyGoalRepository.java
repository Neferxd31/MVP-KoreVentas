package com.koreventas.app.goal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MonthlyGoalRepository extends JpaRepository<MonthlyGoal, UUID> {

  Optional<MonthlyGoal> findByPeriodYearAndPeriodMonth(int year, int month);
}
