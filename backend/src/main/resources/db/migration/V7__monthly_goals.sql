-- =====================================================================
-- V7: Metas mensuales del negocio (Fase 6)
-- - monthly_goals: meta de ingresos y nº de órdenes por mes/tenant
-- Una sola fila por (tenant, año, mes) — único por partial unique index
-- =====================================================================

CREATE TABLE monthly_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_year     INTEGER NOT NULL,
  period_month    INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  revenue_target  NUMERIC(14, 2) NOT NULL CHECK (revenue_target >= 0),
  orders_target   INTEGER NOT NULL DEFAULT 0 CHECK (orders_target >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_monthly_goals_tenant_period UNIQUE (tenant_id, period_year, period_month)
);

CREATE INDEX idx_monthly_goals_tenant ON monthly_goals(tenant_id);

ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_goals FORCE ROW LEVEL SECURITY;

CREATE POLICY monthly_goals_tenant_isolation ON monthly_goals
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);
