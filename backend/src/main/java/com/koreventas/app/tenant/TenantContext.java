package com.koreventas.app.tenant;

import java.util.UUID;

/**
 * Holder thread-local del tenant activo en la petición actual.
 * Lo setea el filtro JWT después de validar el token; lo lee el
 * interceptor que ejecuta `SET LOCAL app.tenant_id` antes de cada query.
 */
public final class TenantContext {

  private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();

  private TenantContext() {}

  public static void set(UUID tenantId) {
    CURRENT.set(tenantId);
  }

  public static UUID get() {
    return CURRENT.get();
  }

  public static void clear() {
    CURRENT.remove();
  }
}
