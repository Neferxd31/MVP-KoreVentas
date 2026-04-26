package com.koreventas.app.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(nullable = false, length = 180)
  private String email;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private UserRole role;

  @Column(nullable = false)
  private boolean enabled;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  @Column(name = "avatar_url", columnDefinition = "TEXT")
  private String avatarUrl;

  protected User() {}

  public User(UUID id, UUID tenantId, String email, String passwordHash,
              String fullName, UserRole role) {
    this.id = id;
    this.tenantId = tenantId;
    this.email = email;
    this.passwordHash = passwordHash;
    this.fullName = fullName;
    this.role = role;
    this.enabled = true;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  public void updateProfile(String fullName, String email, String avatarUrl) {
    if (fullName != null && !fullName.isBlank()) this.fullName = fullName;
    if (email != null && !email.isBlank()) this.email = email;
    this.avatarUrl = avatarUrl;
    this.updatedAt = OffsetDateTime.now();
  }

  public void changePassword(String newHash) {
    this.passwordHash = newHash;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setRole(UserRole role) {
    this.role = role;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
    this.updatedAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public UUID getTenantId() { return tenantId; }
  public String getEmail() { return email; }
  public String getPasswordHash() { return passwordHash; }
  public String getFullName() { return fullName; }
  public UserRole getRole() { return role; }
  public boolean isEnabled() { return enabled; }
  public String getAvatarUrl() { return avatarUrl; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
}
