-- =====================================================================
-- V5: Servicios, Empleados y Agenda (citas)
-- - services: catálogo de servicios (corte, color, masaje, etc.)
-- - employees: recurso asignable a citas (barbero, estilista, etc.)
-- - appointments: agendamiento; al COMPLETAR se genera una venta.
-- Se extiende sale_items con soporte polimórfico (producto O servicio).
-- Todo bajo Row Level Security por tenant.
-- =====================================================================

-- ─── SERVICES ──────────────────────────────────────────────────────────
CREATE TABLE services (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name               VARCHAR(200) NOT NULL,
  description        TEXT,
  duration_minutes   INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  price              NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  tax_rate           NUMERIC(5, 2)  NOT NULL DEFAULT 0,
  color              VARCHAR(20)    NOT NULL DEFAULT '#6366f1',
  active             BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_tenant ON services(tenant_id);
CREATE INDEX idx_services_active ON services(tenant_id, active);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE services FORCE ROW LEVEL SECURITY;

CREATE POLICY services_tenant_isolation ON services
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ─── EMPLOYEES ─────────────────────────────────────────────────────────
CREATE TABLE employees (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name    VARCHAR(150) NOT NULL,
  role         VARCHAR(80),
  phone        VARCHAR(30),
  color        VARCHAR(20) NOT NULL DEFAULT '#64748b',
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_active ON employees(tenant_id, active);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees FORCE ROW LEVEL SECURITY;

CREATE POLICY employees_tenant_isolation ON employees
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ─── APPOINTMENTS ──────────────────────────────────────────────────────
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  employee_id     UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Snapshots (preservan valor histórico si se edita el servicio/cliente)
  service_name    VARCHAR(200) NOT NULL,
  customer_name   VARCHAR(150),
  customer_phone  VARCHAR(30),
  price           NUMERIC(12, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Tiempo (end_at redundante pero acelera queries de solapamiento)
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,

  -- Estado
  status          VARCHAR(20) NOT NULL DEFAULT 'AGENDADA'
                   CHECK (status IN ('AGENDADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO')),
  notes           TEXT,

  -- Se llena automáticamente al completar la cita
  sale_id         UUID REFERENCES sales(id) ON DELETE SET NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_start ON appointments(tenant_id, start_at);
CREATE INDEX idx_appointments_employee ON appointments(tenant_id, employee_id, start_at);
CREATE INDEX idx_appointments_customer ON appointments(tenant_id, customer_id);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

CREATE POLICY appointments_tenant_isolation ON appointments
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', TRUE)::uuid);

-- ─── SALE_ITEMS POLIMÓRFICO ────────────────────────────────────────────
-- Ahora un item puede ser de un PRODUCTO o un SERVICIO.
-- product_id se vuelve nullable; agregamos service_id + item_type.
ALTER TABLE sale_items
  ALTER COLUMN product_id DROP NOT NULL,
  ADD COLUMN service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  ADD COLUMN item_type  VARCHAR(20) NOT NULL DEFAULT 'PRODUCT'
             CHECK (item_type IN ('PRODUCT', 'SERVICE'));

-- Invariante: exactamente uno de product_id / service_id según item_type
ALTER TABLE sale_items
  ADD CONSTRAINT sale_items_polymorphic_chk
  CHECK (
    (item_type = 'PRODUCT' AND product_id IS NOT NULL AND service_id IS NULL)
    OR
    (item_type = 'SERVICE' AND service_id IS NOT NULL AND product_id IS NULL)
  );

CREATE INDEX idx_sale_items_service_id ON sale_items(service_id);
