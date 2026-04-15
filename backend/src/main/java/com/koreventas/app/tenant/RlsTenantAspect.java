package com.koreventas.app.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Antes de ejecutar cualquier método @Transactional aplica
 * `SET LOCAL app.tenant_id = '<uuid>'` en la conexión actual,
 * de modo que las políticas RLS de PostgreSQL filtren por tenant.
 *
 * Si no hay tenant en contexto (ej: registro/login), se setea a
 * un UUID nulo que no matchea ninguna fila.
 */
@Aspect
@Component
public class RlsTenantAspect {

  private static final String NO_TENANT = "00000000-0000-0000-0000-000000000000";

  @PersistenceContext
  private EntityManager em;

  @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
  public Object applyTenant(ProceedingJoinPoint pjp) throws Throwable {
    UUID tenantId = TenantContext.get();
    String value = tenantId != null ? tenantId.toString() : NO_TENANT;
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + value + "'").executeUpdate();
    return pjp.proceed();
  }
}
