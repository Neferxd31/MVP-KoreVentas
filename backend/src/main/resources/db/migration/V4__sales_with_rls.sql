-- =====================================================================
-- V4: Ventas (sales + sale_items) con Row Level Security
-- Flujo: vendedor agrega productos al carrito → cobra → se genera venta
-- Stock se descuenta automáticamente. Cliente se vincula opcionalmente.
-- =====================================================================

CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  -- Totales
  subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_total       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  -- Pago
  payment_method  VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO'
                  CHECK (payment_method IN (
                    'EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA',
                    'TARJETA', 'BRE_B', 'OTRO'
                  )),
  -- Estado
  status          VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA'
                  CHECK (status IN ('COMPLETADA', 'ANULADA')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_created_at ON sales(tenant_id, created_at);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales FORCE ROW LEVEL SECURITY;

CREATE POLICY sales_tenant_isolation ON sales
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ---------------------------------------------------------------------

CREATE TABLE sale_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sale_id         UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name    VARCHAR(200) NOT NULL,  -- snapshot del nombre al momento de la venta
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12, 2) NOT NULL,
  tax_rate        NUMERIC(5, 2) NOT NULL DEFAULT 19.00,
  subtotal        NUMERIC(14, 2) NOT NULL,  -- unit_price * quantity
  tax_amount      NUMERIC(14, 2) NOT NULL,  -- subtotal * tax_rate / 100
  total           NUMERIC(14, 2) NOT NULL,  -- subtotal + tax_amount
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_tenant_id ON sale_items(tenant_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items FORCE ROW LEVEL SECURITY;

CREATE POLICY sale_items_tenant_isolation ON sale_items
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);
