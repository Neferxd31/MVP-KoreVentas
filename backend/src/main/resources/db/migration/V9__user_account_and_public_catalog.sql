-- =====================================================================
-- V9: Cuenta de usuario + Mini-catálogo público
-- - users.avatar_url:        foto del usuario (data URL o https)
-- - tenants.whatsapp_phone:  teléfono al que llegan los pedidos del catálogo público
-- - tenants.public_slug:     identificador URL del catálogo (único por tenant)
-- - tenants.catalog_enabled: toggle on/off del catálogo público
-- =====================================================================

ALTER TABLE users
  ADD COLUMN avatar_url TEXT;

ALTER TABLE tenants
  ADD COLUMN whatsapp_phone   VARCHAR(30),
  ADD COLUMN public_slug      VARCHAR(80),
  ADD COLUMN catalog_enabled  BOOLEAN NOT NULL DEFAULT FALSE;

-- Slug único cuando está presente (parcial)
CREATE UNIQUE INDEX idx_tenants_public_slug ON tenants(public_slug)
  WHERE public_slug IS NOT NULL;
