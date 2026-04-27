package com.koreventas.app.settings;

import com.koreventas.app.security.CurrentUser;
import com.koreventas.app.settings.dto.SettingsResponse;
import com.koreventas.app.settings.dto.UpdateSettingsRequest;
import com.koreventas.app.tenant.Tenant;
import com.koreventas.app.tenant.TenantContext;
import com.koreventas.app.tenant.TenantRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/settings")
public class SettingsController {

  private final SettingsService service;

  public SettingsController(SettingsService service) {
    this.service = service;
  }

  @GetMapping
  public SettingsResponse get() {
    return SettingsResponse.from(service.getCurrent());
  }

  @PutMapping
  public SettingsResponse update(@Valid @RequestBody UpdateSettingsRequest req) {
    return SettingsResponse.from(service.update(req));
  }
}

@Service
class SettingsService {

  private final TenantRepository tenants;
  private final CurrentUser currentUser;

  SettingsService(TenantRepository tenants, CurrentUser currentUser) {
    this.tenants = tenants;
    this.currentUser = currentUser;
  }

  /** GET es lectura: cualquier usuario logueado puede ver el nombre/logo/color del negocio. */
  @Transactional(readOnly = true)
  public Tenant getCurrent() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    return tenants.findById(tenantId)
        .orElseThrow(() -> new IllegalStateException("Tenant no encontrado"));
  }

  /** Solo ADMIN puede modificar la personalización del negocio. */
  @Transactional
  public Tenant update(UpdateSettingsRequest req) {
    currentUser.requireAdmin();
    Tenant t = getCurrent();
    // Si la paleta seleccionada no es 'custom', el customColor se descarta
    String customColor = "custom".equals(req.primaryColor()) ? req.customColor() : null;
    t.updateSettings(req.businessName(), req.logoUrl(), req.primaryColor(), customColor);
    t.updateCatalogSettings(req.whatsappPhone(), req.publicSlug(), req.catalogEnabled());
    return tenants.save(t);
  }
}
