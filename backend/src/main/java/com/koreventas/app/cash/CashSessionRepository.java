package com.koreventas.app.cash;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CashSessionRepository extends JpaRepository<CashSession, UUID> {

  Optional<CashSession> findFirstByStatusOrderByOpenedAtDesc(CashSession.Status status);

  List<CashSession> findAllByOrderByOpenedAtDesc();
}
