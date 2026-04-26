package com.koreventas.app.settings.dto;

import com.koreventas.app.tenant.Tenant;

public record SettingsResponse(
    String businessName,
    String logoUrl,
    String primaryColor,
    String customColor,
    String businessType
) {
  public static SettingsResponse from(Tenant t) {
    return new SettingsResponse(
        t.getBusinessName(),
        t.getLogoUrl(),
        t.getPrimaryColor(),
        t.getCustomColor(),
        t.getBusinessType()
    );
  }
}
