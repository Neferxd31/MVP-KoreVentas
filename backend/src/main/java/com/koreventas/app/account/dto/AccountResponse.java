package com.koreventas.app.account.dto;

import com.koreventas.app.user.User;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AccountResponse(
    UUID id,
    String email,
    String fullName,
    String role,
    String avatarUrl,
    boolean enabled,
    OffsetDateTime createdAt
) {
  public static AccountResponse from(User u) {
    return new AccountResponse(
        u.getId(), u.getEmail(), u.getFullName(),
        u.getRole().name(), u.getAvatarUrl(),
        u.isEnabled(), u.getCreatedAt()
    );
  }
}
