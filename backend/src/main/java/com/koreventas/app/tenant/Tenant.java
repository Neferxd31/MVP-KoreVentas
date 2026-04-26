package com.koreventas.app.tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

  @Id
  private UUID id;

  @Column(nullable = false, length = 150)
  private String name;

  @Column(name = "business_type", nullable = false, length = 50)
  private String businessType;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  // ── Personalización (Fase 8) ──────────────────────────────────────
  @Column(name = "business_name", length = 150)
  private String businessName;

  @Column(name = "logo_url", columnDefinition = "TEXT")
  private String logoUrl;

  /** Clave de paleta: indigo|teal|rose|amber|emerald|slate|custom */
  @Column(name = "primary_color", nullable = false, length = 20)
  private String primaryColor = "indigo";

  /** HEX (#RRGGBB) cuando primaryColor = 'custom'. Null en otro caso. */
  @Column(name = "custom_color", length = 7)
  private String customColor;

  // ── Catálogo público (Fase 9) ─────────────────────────────────────
  @Column(name = "whatsapp_phone", length = 30)
  private String whatsappPhone;

  @Column(name = "public_slug", length = 80)
  private String publicSlug;

  @Column(name = "catalog_enabled", nullable = false)
  private boolean catalogEnabled = false;

  protected Tenant() {}

  public Tenant(UUID id, String name, String businessType) {
    this.id = id;
    this.name = name;
    this.businessType = businessType;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
    this.businessName = name;
  }

  public void updateSettings(String businessName, String logoUrl,
                             String primaryColor, String customColor) {
    if (businessName != null) this.businessName = businessName;
    this.logoUrl = logoUrl;
    if (primaryColor != null) this.primaryColor = primaryColor;
    this.customColor = customColor;
    this.updatedAt = OffsetDateTime.now();
  }

  public void updateCatalogSettings(String whatsappPhone, String publicSlug, Boolean catalogEnabled) {
    this.whatsappPhone = whatsappPhone;
    this.publicSlug = publicSlug;
    if (catalogEnabled != null) this.catalogEnabled = catalogEnabled;
    this.updatedAt = OffsetDateTime.now();
  }

  public UUID getId() { return id; }
  public String getName() { return name; }
  public String getBusinessType() { return businessType; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public String getBusinessName() { return businessName != null ? businessName : name; }
  public String getLogoUrl() { return logoUrl; }
  public String getPrimaryColor() { return primaryColor; }
  public String getCustomColor() { return customColor; }
  public String getWhatsappPhone() { return whatsappPhone; }
  public String getPublicSlug() { return publicSlug; }
  public boolean isCatalogEnabled() { return catalogEnabled; }
}
