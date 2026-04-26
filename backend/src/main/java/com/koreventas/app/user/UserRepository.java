package com.koreventas.app.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

import java.util.List;

public interface UserRepository extends JpaRepository<User, UUID> {

  Optional<User> findByEmail(String email);

  List<User> findByTenantIdOrderByCreatedAtAsc(UUID tenantId);
}
