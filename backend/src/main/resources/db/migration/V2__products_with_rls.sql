-- =====================================================================
-- V2: Productos con Row Level Security
-- Primera tabla de negocio con aislamiento multi-tenant real.
-- =====================================================================

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_tenant_unique UNIQUE (tenant_id, name)
);

CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories FORCE ROW LEVEL SECURITY;

CREATE POLICY categories_tenant_isolation ON categories
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ---------------------------------------------------------------------

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  barcode         VARCHAR(100),
  price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  cost            NUMERIC(12, 2) CHECK (cost >= 0),
  tax_rate        NUMERIC(5, 2) NOT NULL DEFAULT 19.00,  -- IVA 19%, 5%, o 0%
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_alert     INTEGER NOT NULL DEFAULT 5,             -- umbral para alerta de stock bajo
  image_url       TEXT,
  is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_barcode_tenant_unique UNIQUE (tenant_id, barcode)
);

CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_barcode ON products(tenant_id, barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_name ON products(tenant_id, name);

-- RLS: cada tenant solo ve sus productos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;

CREATE POLICY products_tenant_isolation ON products
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);
