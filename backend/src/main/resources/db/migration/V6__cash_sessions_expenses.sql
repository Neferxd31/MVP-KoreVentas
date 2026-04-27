-- =====================================================================
-- V6: Caja diaria (cash_sessions) + Gastos (expenses)
-- - cash_sessions: apertura/cierre con arqueo contra ventas en efectivo
-- - expense_categories: categorías de gastos
-- - expenses: egresos (arriendo, insumos, nómina, etc.)
-- Todo bajo Row Level Security por tenant.
-- =====================================================================

-- ─── EXPENSE CATEGORIES ───────────────────────────────────────────────
CREATE TABLE expense_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(80) NOT NULL,
  color       VARCHAR(20) NOT NULL DEFAULT '#64748b',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expense_categories_tenant ON expense_categories(tenant_id);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories FORCE ROW LEVEL SECURITY;

CREATE POLICY expense_categories_tenant_isolation ON expense_categories
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ─── EXPENSES ─────────────────────────────────────────────────────────
CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description     VARCHAR(300) NOT NULL,
  amount          NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  payment_method  VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO',
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX idx_expenses_date ON expenses(tenant_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;

CREATE POLICY expenses_tenant_isolation ON expenses
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ─── CASH SESSIONS ────────────────────────────────────────────────────
-- Una sesión por día/caja. Solo una ABIERTA por tenant a la vez.
CREATE TABLE cash_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  opened_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  opened_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at           TIMESTAMPTZ,
  opening_amount      NUMERIC(14, 2) NOT NULL CHECK (opening_amount >= 0),
  -- Al cerrar: efectivo contado físicamente
  counted_amount      NUMERIC(14, 2),
  -- Snapshot al cierre: esperado según ventas
  expected_amount     NUMERIC(14, 2),
  difference          NUMERIC(14, 2),  -- counted - expected
  status              VARCHAR(20) NOT NULL DEFAULT 'ABIERTA'
                      CHECK (status IN ('ABIERTA', 'CERRADA')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cash_sessions_tenant ON cash_sessions(tenant_id);
CREATE INDEX idx_cash_sessions_status ON cash_sessions(tenant_id, status);
CREATE INDEX idx_cash_sessions_opened ON cash_sessions(tenant_id, opened_at DESC);

-- Solo una sesión ABIERTA por tenant a la vez
CREATE UNIQUE INDEX idx_cash_sessions_unique_open
  ON cash_sessions(tenant_id) WHERE status = 'ABIERTA';

ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY cash_sessions_tenant_isolation ON cash_sessions
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);
