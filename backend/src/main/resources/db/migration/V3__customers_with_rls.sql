-- =====================================================================
-- V3: Clientes (CRM) con Row Level Security
-- Auto-etiquetado: NUEVO, FRECUENTE, VIP, INACTIVO
-- Vinculación automática por teléfono (RF-06, RF-11)
-- =====================================================================

CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name       VARCHAR(150) NOT NULL,
  phone           VARCHAR(30),
  email           VARCHAR(180),
  notes           TEXT,
  birthday        DATE,
  -- Auto-etiquetado por comportamiento
  auto_tag        VARCHAR(20) NOT NULL DEFAULT 'NUEVO'
                  CHECK (auto_tag IN ('NUEVO', 'FRECUENTE', 'VIP', 'INACTIVO')),
  -- Etiquetas manuales del usuario (JSON array de strings)
  manual_tags     JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Métricas calculadas
  total_purchases INTEGER NOT NULL DEFAULT 0,
  total_spent     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  avg_ticket      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  last_visit_at   TIMESTAMPTZ,
  -- Frecuencia promedio en días entre visitas
  avg_days_between_visits NUMERIC(6, 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customers_phone_tenant_unique UNIQUE (tenant_id, phone)
);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_auto_tag ON customers(tenant_id, auto_tag);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

CREATE POLICY customers_tenant_isolation ON customers
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);
