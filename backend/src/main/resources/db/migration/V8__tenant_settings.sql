-- =====================================================================
-- V8: Personalización del negocio (Fase de identidad)
-- - business_name: nombre comercial visible (puede diferir de tenants.name interno)
-- - logo_url:      data URL o URL a logo del negocio (TEXT permite ambos)
-- - primary_color: clave de paleta predefinida (indigo, teal, rose, ...) o "custom"
-- - custom_color:  HEX del color principal cuando primary_color = 'custom'
-- =====================================================================

ALTER TABLE tenants
  ADD COLUMN business_name  VARCHAR(150),
  ADD COLUMN logo_url       TEXT,
  ADD COLUMN primary_color  VARCHAR(20) NOT NULL DEFAULT 'indigo',
  ADD COLUMN custom_color   VARCHAR(7);

-- Inicializar business_name = name para tenants existentes (no nulos)
UPDATE tenants SET business_name = name WHERE business_name IS NULL;
