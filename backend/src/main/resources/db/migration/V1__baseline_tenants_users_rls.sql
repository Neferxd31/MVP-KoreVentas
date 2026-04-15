-- =====================================================================
-- V1: Baseline schema
-- Tablas: tenants, users
--
-- Multi-tenant aislado por Row Level Security (RLS) nativo de PostgreSQL.
-- En esta migración solo se crean las tablas de auth (tenants, users),
-- que NO llevan RLS porque se consultan antes de tener contexto de tenant
-- (registro y login). El patrón RLS se aplicará a las tablas de negocio
-- (products, customers, sales, ...) en migraciones futuras.
--
-- El aspecto Java `RlsTenantAspect` ya está en su lugar para ejecutar
-- `SET LOCAL app.tenant_id = '<uuid>'` antes de cada transacción.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- Tenants (un tenant = un negocio cliente del SaaS)
-- ---------------------------------------------------------------------
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  business_type VARCHAR(50)  NOT NULL,  -- tienda, barberia, salon, papeleria, otro
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Users (cuentas de acceso al sistema, pertenecen a un tenant)
-- Email globalmente único para simplificar el flujo de login.
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'SELLER')),
  enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
