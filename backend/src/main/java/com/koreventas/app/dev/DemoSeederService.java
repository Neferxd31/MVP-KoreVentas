package com.koreventas.app.dev;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Crea un tenant completo de demostración con datos realistas:
 *   - Negocio "Barbería El Capitán" con personalización (nombre, color amber)
 *   - 1 admin + 2 vendedores
 *   - 8 productos (con costos para mostrar margen y rentabilidad)
 *   - 5 servicios (corte, barba, etc.)
 *   - 12 clientes (mix de etiquetas, algunos con cumpleaños esta semana)
 *   - ~30 ventas distribuidas en últimos 30 días
 *   - 8 citas (pasadas completadas + futuras agendadas)
 *   - Sesión de caja abierta hoy
 *   - 6 gastos del mes (categorizados)
 *   - Meta del mes definida
 *   - Catálogo público activado con slug "el-capitan"
 *
 * Idempotente: si se llama de nuevo, borra y recrea desde cero.
 */
@Service
public class DemoSeederService {

  private static final String DEMO_EMAIL = "demo@koreventas.com";
  private static final String DEMO_PASSWORD = "demo1234";
  private static final String DEMO_BUSINESS_NAME = "Barbería El Capitán";
  private static final String DEMO_SLUG = "el-capitan";
  private static final String DEMO_WHATSAPP = "573001234567";

  @PersistenceContext
  private EntityManager em;

  private final PasswordEncoder encoder;
  private final Random random = new Random(42); // semilla fija → datos reproducibles

  public DemoSeederService(PasswordEncoder encoder) {
    this.encoder = encoder;
  }

  @Transactional
  public Map<String, Object> seedDemoTenant() {
    // 1) Borrar tenant demo anterior si existe (cascade limpia todo)
    cleanupExistingDemo();

    // 2) Crear tenant + activar RLS para él
    UUID tenantId = createTenant();
    setLocalTenant(tenantId);

    // 3) Usuarios
    UUID adminId = createUser(tenantId, DEMO_EMAIL, DEMO_PASSWORD,
        "Carlos Ramírez", "ADMIN");
    createUser(tenantId, "juan@elcapitan.com", "demo1234",
        "Juan Mendoza", "SELLER");
    createUser(tenantId, "andres@elcapitan.com", "demo1234",
        "Andrés López", "SELLER");

    // 4) Categorías + productos (con costos)
    UUID catCuidado = createCategory(tenantId, "Cuidado");
    UUID catHerramientas = createCategory(tenantId, "Herramientas");
    UUID catAccesorios = createCategory(tenantId, "Accesorios");

    List<UUID> productIds = createProducts(tenantId, catCuidado, catHerramientas, catAccesorios);

    // 5) Servicios
    List<UUID> serviceIds = createServices(tenantId);

    // 6) Empleados (uno asociado al admin user)
    List<UUID> employeeIds = createEmployees(tenantId, adminId);

    // 7) Clientes (mix de etiquetas y cumpleaños)
    List<UUID> customerIds = createCustomers(tenantId);

    // 8) Citas (pasadas + futuras)
    createAppointments(tenantId, serviceIds, employeeIds, customerIds);

    // 9) Ventas distribuidas en último mes
    createSales(tenantId, productIds, serviceIds, customerIds);

    // 10) Caja abierta hoy
    createOpenCashSession(tenantId, adminId);

    // 11) Gastos del mes
    createExpenses(tenantId);

    // 12) Meta del mes
    createMonthlyGoal(tenantId);

    Map<String, Object> result = new HashMap<>();
    result.put("ok", true);
    result.put("message", "Datos demo cargados correctamente");
    result.put("credentials", Map.of(
        "email", DEMO_EMAIL,
        "password", DEMO_PASSWORD
    ));
    result.put("businessName", DEMO_BUSINESS_NAME);
    result.put("publicCatalogSlug", DEMO_SLUG);
    result.put("tip", "Inicia sesión con esas credenciales y explora todas las pantallas. " +
        "El catálogo público está activo en /c/" + DEMO_SLUG);
    return result;
  }

  // ─── Helpers de bajo nivel ─────────────────────────────────────────

  private void setLocalTenant(UUID tenantId) {
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  private void cleanupExistingDemo() {
    @SuppressWarnings("unchecked")
    List<Object> ids = em.createNativeQuery(
        "SELECT id FROM tenants WHERE name = ?1 OR business_name = ?2")
        .setParameter(1, DEMO_BUSINESS_NAME)
        .setParameter(2, DEMO_BUSINESS_NAME)
        .getResultList();

    for (Object idObj : ids) {
      UUID tenantId = (UUID) idObj;
      setLocalTenant(tenantId);
      // Borrar dependencias en orden inverso (FK constraints)
      em.createNativeQuery("DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales)").executeUpdate();
      em.createNativeQuery("DELETE FROM sales").executeUpdate();
      em.createNativeQuery("DELETE FROM appointments").executeUpdate();
      em.createNativeQuery("DELETE FROM cash_sessions").executeUpdate();
      em.createNativeQuery("DELETE FROM expenses").executeUpdate();
      em.createNativeQuery("DELETE FROM expense_categories").executeUpdate();
      em.createNativeQuery("DELETE FROM monthly_goals").executeUpdate();
      em.createNativeQuery("DELETE FROM products").executeUpdate();
      em.createNativeQuery("DELETE FROM services").executeUpdate();
      em.createNativeQuery("DELETE FROM employees").executeUpdate();
      em.createNativeQuery("DELETE FROM customers").executeUpdate();
      em.createNativeQuery("DELETE FROM categories").executeUpdate();
      // users tiene RLS, tenants no
      em.createNativeQuery("DELETE FROM users WHERE tenant_id = ?1")
          .setParameter(1, tenantId).executeUpdate();
      em.createNativeQuery("DELETE FROM tenants WHERE id = ?1")
          .setParameter(1, tenantId).executeUpdate();
    }
    em.flush();
  }

  // ─── 1) Tenant ─────────────────────────────────────────────────────

  private UUID createTenant() {
    UUID id = UUID.randomUUID();
    em.createNativeQuery(
        "INSERT INTO tenants (id, name, business_type, business_name, " +
            "primary_color, public_slug, whatsapp_phone, catalog_enabled, " +
            "created_at, updated_at) " +
            "VALUES (?1, ?2, 'barberia', ?3, 'amber', ?4, ?5, true, now(), now())")
        .setParameter(1, id)
        .setParameter(2, DEMO_BUSINESS_NAME)
        .setParameter(3, DEMO_BUSINESS_NAME)
        .setParameter(4, DEMO_SLUG)
        .setParameter(5, DEMO_WHATSAPP)
        .executeUpdate();
    return id;
  }

  // ─── 2) Usuarios ───────────────────────────────────────────────────

  private UUID createUser(UUID tenantId, String email, String password,
                          String fullName, String role) {
    UUID id = UUID.randomUUID();
    em.createNativeQuery(
        "INSERT INTO users (id, tenant_id, email, password_hash, full_name, " +
            "role, enabled, created_at, updated_at) " +
            "VALUES (?1, ?2, ?3, ?4, ?5, ?6, true, now(), now())")
        .setParameter(1, id)
        .setParameter(2, tenantId)
        .setParameter(3, email)
        .setParameter(4, encoder.encode(password))
        .setParameter(5, fullName)
        .setParameter(6, role)
        .executeUpdate();
    return id;
  }

  // ─── 3) Categorías + productos ─────────────────────────────────────

  private UUID createCategory(UUID tenantId, String name) {
    UUID id = UUID.randomUUID();
    em.createNativeQuery(
        "INSERT INTO categories (id, tenant_id, name, created_at) " +
            "VALUES (?1, ?2, ?3, now())")
        .setParameter(1, id).setParameter(2, tenantId).setParameter(3, name)
        .executeUpdate();
    return id;
  }

  private List<UUID> createProducts(UUID tenantId, UUID catCuidado,
                                    UUID catHerramientas, UUID catAccesorios) {
    Object[][] data = {
        // name, description, price, cost, taxRate, stock, stockAlert, favorite, categoryId
        {"Cera fijadora premium", "Fijación fuerte, acabado mate", 25_000, 12_000, 19, 24, 5, true, catCuidado},
        {"Pomada mate", "Acabado natural, fácil de lavar", 20_000, 8_000, 19, 18, 5, true, catCuidado},
        {"Shampoo para barba", "Limpia profundo sin resecar", 35_000, 15_000, 19, 12, 4, true, catCuidado},
        {"Aceite hidratante para barba", "Suaviza y da brillo", 30_000, 14_000, 19, 15, 4, false, catCuidado},
        {"Máquina de afeitar premium", "Acero inoxidable, mango ergonómico", 80_000, 40_000, 19, 6, 2, false, catHerramientas},
        {"Toalla turbante", "Microfibra absorbente", 15_000, 5_000, 19, 30, 8, false, catAccesorios},
        {"Crema para afeitar", "Suave y refrescante", 18_000, 7_000, 19, 22, 5, false, catCuidado},
        {"Loción after-shave", "Calma e hidrata la piel", 22_000, 10_000, 19, 3, 5, true, catCuidado}, // stock bajo
    };

    List<UUID> ids = new java.util.ArrayList<>();
    for (Object[] row : data) {
      UUID id = UUID.randomUUID();
      em.createNativeQuery(
          "INSERT INTO products (id, tenant_id, category_id, name, description, " +
              "price, cost, tax_rate, stock, stock_alert, is_favorite, active, " +
              "created_at, updated_at) " +
              "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, true, " +
              "now() - interval '20 days', now())")
          .setParameter(1, id)
          .setParameter(2, tenantId)
          .setParameter(3, row[8])
          .setParameter(4, row[0])
          .setParameter(5, row[1])
          .setParameter(6, new BigDecimal(row[2].toString()))
          .setParameter(7, new BigDecimal(row[3].toString()))
          .setParameter(8, new BigDecimal(row[4].toString()))
          .setParameter(9, row[5])
          .setParameter(10, row[6])
          .setParameter(11, row[7])
          .executeUpdate();
      ids.add(id);
    }
    return ids;
  }

  // ─── 4) Servicios ──────────────────────────────────────────────────

  private List<UUID> createServices(UUID tenantId) {
    Object[][] data = {
        // name, description, duration, price, color
        {"Corte clásico", "Corte tradicional con tijera y máquina", 30, 25_000, "#f59e0b"},
        {"Corte + barba", "Corte completo con perfilado de barba", 45, 40_000, "#d97706"},
        {"Solo barba", "Perfilado y arreglo de barba", 20, 20_000, "#ef4444"},
        {"Tinte para barba", "Coloración profesional", 60, 60_000, "#8b5cf6"},
        {"Diseño de cejas", "Perfilado masculino", 15, 15_000, "#06b6d4"},
    };

    List<UUID> ids = new java.util.ArrayList<>();
    for (Object[] row : data) {
      UUID id = UUID.randomUUID();
      em.createNativeQuery(
          "INSERT INTO services (id, tenant_id, name, description, duration_minutes, " +
              "price, tax_rate, color, active, created_at, updated_at) " +
              "VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0.00, ?7, true, " +
              "now() - interval '20 days', now())")
          .setParameter(1, id)
          .setParameter(2, tenantId)
          .setParameter(3, row[0])
          .setParameter(4, row[1])
          .setParameter(5, row[2])
          .setParameter(6, new BigDecimal(row[3].toString()))
          .setParameter(7, row[4])
          .executeUpdate();
      ids.add(id);
    }
    return ids;
  }

  // ─── 5) Empleados ──────────────────────────────────────────────────

  private List<UUID> createEmployees(UUID tenantId, UUID adminUserId) {
    Object[][] data = {
        // fullName, role, phone, color
        {"Carlos Ramírez", "Maestro barbero", "3001234567", "#f59e0b"},
        {"Juan Mendoza", "Barbero senior", "3009876543", "#d97706"},
        {"Andrés López", "Barbero junior", "3015551234", "#ef4444"},
    };

    List<UUID> ids = new java.util.ArrayList<>();
    for (int i = 0; i < data.length; i++) {
      Object[] row = data[i];
      UUID id = UUID.randomUUID();
      em.createNativeQuery(
          "INSERT INTO employees (id, tenant_id, full_name, role, phone, color, " +
              "active, created_at, updated_at) " +
              "VALUES (?1, ?2, ?3, ?4, ?5, ?6, true, " +
              "now() - interval '30 days', now())")
          .setParameter(1, id)
          .setParameter(2, tenantId)
          .setParameter(3, row[0])
          .setParameter(4, row[1])
          .setParameter(5, row[2])
          .setParameter(6, row[3])
          .executeUpdate();
      ids.add(id);
    }
    // Solo usado para evitar warning de unused parameter
    if (adminUserId == null) throw new IllegalStateException();
    return ids;
  }

  // ─── 6) Clientes ───────────────────────────────────────────────────

  private List<UUID> createCustomers(UUID tenantId) {
    LocalDate today = LocalDate.now();

    // Mix variado: VIP frecuentes, nuevos, inactivos, con cumpleaños cerca
    Object[][] data = {
        // fullName, phone, email, birthday, daysAgoLastVisit
        {"Felipe Castro", "3201112233", "felipe@example.com", today.plusDays(2), 3},
        {"Mariana Torres", "3157894561", "mariana@example.com", today.plusDays(5), 1},
        {"Roberto Vargas", "3009998877", null, today.minusYears(35).withMonth(today.getMonthValue()).withDayOfMonth(Math.min(today.getDayOfMonth() + 1, 28)), 2},
        {"Ana Quintero", "3134567890", "ana.q@example.com", today.minusYears(28).withMonth(3).withDayOfMonth(15), 8},
        {"Diego Ramírez", "3001234500", null, today.minusYears(40).withMonth(7).withDayOfMonth(22), 12},
        {"Sofía Mendoza", "3187654321", "sofi@example.com", today.minusYears(32).withMonth(11).withDayOfMonth(3), 5},
        {"Andrés Pérez", "3024567890", null, today.minusYears(45).withMonth(1).withDayOfMonth(8), 75},  // INACTIVO
        {"Luisa Gómez", "3216548790", "luisa@example.com", today.minusYears(29).withMonth(today.getMonthValue()).withDayOfMonth(Math.min(today.getDayOfMonth() + 4, 27)), 65}, // INACTIVO + cumple
        {"Camilo Rojas", "3145678123", null, today.minusYears(38).withMonth(5).withDayOfMonth(18), 80},  // INACTIVO
        {"Valentina Ruiz", "3175551122", "valen@example.com", today.minusYears(26).withMonth(9).withDayOfMonth(30), 15},
        {"Sebastián Niño", "3057894561", null, today.minusYears(33).withMonth(2).withDayOfMonth(11), 4},
        {"Paula Herrera", "3198887766", "paula@example.com", today.minusYears(31).withMonth(today.getMonthValue()).withDayOfMonth(Math.min(today.getDayOfMonth() + 6, 26)), 7},
    };

    List<UUID> ids = new java.util.ArrayList<>();
    for (Object[] row : data) {
      UUID id = UUID.randomUUID();
      LocalDate birthday = (LocalDate) row[3];
      int daysAgo = (int) row[4];
      em.createNativeQuery(
          "INSERT INTO customers (id, tenant_id, full_name, phone, email, " +
              "birthday, auto_tag, manual_tags, total_purchases, total_spent, " +
              "avg_ticket, last_visit_at, created_at, updated_at) " +
              "VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'NUEVO', '[]'::jsonb, 0, 0, 0, " +
              "now() - (?7 || ' days')::interval, " +
              "now() - interval '60 days', now())")
          .setParameter(1, id)
          .setParameter(2, tenantId)
          .setParameter(3, row[0])
          .setParameter(4, row[1])
          .setParameter(5, row[2])
          .setParameter(6, birthday)
          .setParameter(7, daysAgo)
          .executeUpdate();
      ids.add(id);
    }
    return ids;
  }

  // ─── 7) Citas ──────────────────────────────────────────────────────

  private void createAppointments(UUID tenantId, List<UUID> serviceIds,
                                  List<UUID> employeeIds, List<UUID> customerIds) {
    // 5 citas pasadas COMPLETADAS (últimos 14 días)
    for (int i = 0; i < 5; i++) {
      int daysAgo = random.nextInt(14) + 1;
      int hour = 9 + random.nextInt(8);
      UUID svcId = serviceIds.get(random.nextInt(serviceIds.size()));
      UUID empId = employeeIds.get(random.nextInt(employeeIds.size()));
      UUID custId = customerIds.get(random.nextInt(customerIds.size()));
      Object[] svc = fetchServiceData(svcId);
      insertAppointment(tenantId, svcId, empId, custId, svc,
          OffsetDateTime.now().minusDays(daysAgo).withHour(hour).withMinute(0).withSecond(0).withNano(0),
          "COMPLETADA");
    }

    // 3 citas FUTURAS AGENDADAS (próximos 7 días)
    for (int i = 0; i < 3; i++) {
      int daysAhead = i + 1;
      int hour = 10 + i * 2;
      UUID svcId = serviceIds.get(i % serviceIds.size());
      UUID empId = employeeIds.get(i % employeeIds.size());
      UUID custId = customerIds.get(i % customerIds.size());
      Object[] svc = fetchServiceData(svcId);
      insertAppointment(tenantId, svcId, empId, custId, svc,
          OffsetDateTime.now().plusDays(daysAhead).withHour(hour).withMinute(0).withSecond(0).withNano(0),
          "AGENDADA");
    }
  }

  private Object[] fetchServiceData(UUID serviceId) {
    return (Object[]) em.createNativeQuery(
        "SELECT name, duration_minutes, price FROM services WHERE id = ?1")
        .setParameter(1, serviceId).getSingleResult();
  }

  private void insertAppointment(UUID tenantId, UUID serviceId, UUID employeeId,
                                 UUID customerId, Object[] svc,
                                 OffsetDateTime startAt, String status) {
    String name = (String) svc[0];
    int duration = ((Number) svc[1]).intValue();
    BigDecimal price = (BigDecimal) svc[2];
    OffsetDateTime endAt = startAt.plusMinutes(duration);

    em.createNativeQuery(
        "INSERT INTO appointments (id, tenant_id, customer_id, service_id, " +
            "employee_id, service_name, duration_minutes, price, start_at, end_at, " +
            "status, created_at, updated_at) " +
            "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, now(), now())")
        .setParameter(1, UUID.randomUUID())
        .setParameter(2, tenantId)
        .setParameter(3, customerId)
        .setParameter(4, serviceId)
        .setParameter(5, employeeId)
        .setParameter(6, name)
        .setParameter(7, duration)
        .setParameter(8, price)
        .setParameter(9, startAt)
        .setParameter(10, endAt)
        .setParameter(11, status)
        .executeUpdate();
  }

  // ─── 8) Ventas ─────────────────────────────────────────────────────

  private void createSales(UUID tenantId, List<UUID> productIds,
                           List<UUID> serviceIds, List<UUID> customerIds) {
    String[] paymentMethods = {"EFECTIVO", "EFECTIVO", "EFECTIVO", "NEQUI", "NEQUI",
        "DAVIPLATA", "TARJETA", "TRANSFERENCIA"};

    // 30 ventas distribuidas en últimos 28 días, con peso mayor en últimos días
    int totalSales = 30;
    for (int i = 0; i < totalSales; i++) {
      // Distribución: más ventas recientes
      int daysAgo = (int) (random.nextDouble() * random.nextDouble() * 28);
      int hour = 9 + random.nextInt(10);
      int minute = random.nextInt(60);
      OffsetDateTime saleAt = OffsetDateTime.now().minusDays(daysAgo)
          .withHour(hour).withMinute(minute).withSecond(0).withNano(0);

      String paymentMethod = paymentMethods[random.nextInt(paymentMethods.length)];

      // 70% de las ventas tienen cliente identificado
      UUID customerId = random.nextDouble() < 0.7
          ? customerIds.get(random.nextInt(customerIds.size()))
          : null;

      // Cada venta tiene 1-3 ítems (mix de productos y servicios)
      int itemCount = 1 + random.nextInt(3);
      List<Object[]> items = new java.util.ArrayList<>();
      BigDecimal subtotalAccum = BigDecimal.ZERO;
      BigDecimal taxAccum = BigDecimal.ZERO;
      BigDecimal totalAccum = BigDecimal.ZERO;

      for (int j = 0; j < itemCount; j++) {
        boolean isService = random.nextDouble() < 0.55; // ligeramente más servicios
        Object[] itemRow;
        if (isService) {
          UUID svcId = serviceIds.get(random.nextInt(serviceIds.size()));
          Object[] svc = (Object[]) em.createNativeQuery(
              "SELECT id, name, price, tax_rate FROM services WHERE id = ?1")
              .setParameter(1, svcId).getSingleResult();
          itemRow = new Object[]{"SERVICE", svc[0], null, svc[1], 1, svc[2], svc[3]};
        } else {
          UUID prodId = productIds.get(random.nextInt(productIds.size()));
          Object[] prod = (Object[]) em.createNativeQuery(
              "SELECT id, name, price, tax_rate FROM products WHERE id = ?1")
              .setParameter(1, prodId).getSingleResult();
          int qty = 1 + random.nextInt(2);
          itemRow = new Object[]{"PRODUCT", null, prod[0], prod[1], qty, prod[2], prod[3]};
        }
        items.add(itemRow);

        // tax_rate viene en porcentaje (ej: 19.00). Subtotal = qty * price.
        // Tax amount = subtotal * tax_rate / 100. Total = subtotal + tax.
        int qty = (int) itemRow[4];
        BigDecimal price = (BigDecimal) itemRow[5];
        BigDecimal taxRate = (BigDecimal) itemRow[6];
        BigDecimal sub = price.multiply(BigDecimal.valueOf(qty));
        BigDecimal tax = sub.multiply(taxRate).divide(BigDecimal.valueOf(100));
        BigDecimal tot = sub.add(tax);
        subtotalAccum = subtotalAccum.add(sub);
        taxAccum = taxAccum.add(tax);
        totalAccum = totalAccum.add(tot);
      }

      UUID saleId = UUID.randomUUID();
      em.createNativeQuery(
          "INSERT INTO sales (id, tenant_id, customer_id, subtotal, tax_total, total, " +
              "payment_method, status, created_at) " +
              "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'COMPLETADA', ?8)")
          .setParameter(1, saleId)
          .setParameter(2, tenantId)
          .setParameter(3, customerId)
          .setParameter(4, subtotalAccum)
          .setParameter(5, taxAccum)
          .setParameter(6, totalAccum)
          .setParameter(7, paymentMethod)
          .setParameter(8, saleAt)
          .executeUpdate();

      // Items
      for (Object[] item : items) {
        int qty = (int) item[4];
        BigDecimal price = (BigDecimal) item[5];
        BigDecimal taxRate = (BigDecimal) item[6];
        BigDecimal sub = price.multiply(BigDecimal.valueOf(qty));
        BigDecimal tax = sub.multiply(taxRate).divide(BigDecimal.valueOf(100));
        BigDecimal tot = sub.add(tax);
        em.createNativeQuery(
            "INSERT INTO sale_items (id, tenant_id, sale_id, item_type, service_id, " +
                "product_id, product_name, quantity, unit_price, tax_rate, " +
                "subtotal, tax_amount, total) " +
                "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)")
            .setParameter(1, UUID.randomUUID())
            .setParameter(2, tenantId)
            .setParameter(3, saleId)
            .setParameter(4, item[0])
            .setParameter(5, item[1])
            .setParameter(6, item[2])
            .setParameter(7, item[3])
            .setParameter(8, qty)
            .setParameter(9, price)
            .setParameter(10, taxRate)
            .setParameter(11, sub)
            .setParameter(12, tax)
            .setParameter(13, tot)
            .executeUpdate();
      }
    }

    // Recalcular métricas de clientes basadas en sus ventas
    em.createNativeQuery(
        "UPDATE customers c SET " +
            "total_purchases = sub.cnt, " +
            "total_spent = sub.tot, " +
            "avg_ticket = sub.tot / GREATEST(sub.cnt, 1), " +
            "last_visit_at = sub.last_visit " +
            "FROM (SELECT customer_id, COUNT(*) AS cnt, SUM(total) AS tot, " +
            "MAX(created_at) AS last_visit FROM sales " +
            "WHERE customer_id IS NOT NULL AND status = 'COMPLETADA' " +
            "GROUP BY customer_id) AS sub " +
            "WHERE c.id = sub.customer_id")
        .executeUpdate();

    // Re-aplicar etiquetas automáticas (días sin visita se calcula al vuelo)
    em.createNativeQuery(
        "UPDATE customers SET auto_tag = CASE " +
            "WHEN total_purchases >= 5 AND total_spent >= 200000 THEN 'VIP' " +
            "WHEN total_purchases >= 3 THEN 'FRECUENTE' " +
            "WHEN last_visit_at IS NOT NULL AND " +
            "  EXTRACT(DAY FROM now() - last_visit_at) > 60 THEN 'INACTIVO' " +
            "ELSE 'NUEVO' END")
        .executeUpdate();
  }

  // ─── 9) Caja abierta ───────────────────────────────────────────────

  private void createOpenCashSession(UUID tenantId, UUID adminId) {
    em.createNativeQuery(
        "INSERT INTO cash_sessions (id, tenant_id, opened_by, opened_at, " +
            "opening_amount, status) " +
            "VALUES (?1, ?2, ?3, " +
            "date_trunc('day', now()) + interval '8 hours', 100000, 'ABIERTA')")
        .setParameter(1, UUID.randomUUID())
        .setParameter(2, tenantId)
        .setParameter(3, adminId)
        .executeUpdate();
  }

  // ─── 10) Gastos ────────────────────────────────────────────────────

  private void createExpenses(UUID tenantId) {
    Object[][] cats = {
        {"Arriendo", "#ef4444"},
        {"Servicios públicos", "#f59e0b"},
        {"Insumos", "#8b5cf6"},
        {"Marketing", "#06b6d4"},
        {"Nómina", "#10b981"},
    };
    Map<String, UUID> catIds = new HashMap<>();
    for (Object[] cat : cats) {
      UUID id = UUID.randomUUID();
      em.createNativeQuery(
          "INSERT INTO expense_categories (id, tenant_id, name, color, created_at) " +
              "VALUES (?1, ?2, ?3, ?4, now() - interval '20 days')")
          .setParameter(1, id).setParameter(2, tenantId)
          .setParameter(3, cat[0]).setParameter(4, cat[1])
          .executeUpdate();
      catIds.put((String) cat[0], id);
    }

    Object[][] expenses = {
        // catName, description, amount, daysAgo, paymentMethod
        {"Arriendo", "Arriendo del local - mes en curso", 1_500_000, 5, "TRANSFERENCIA"},
        {"Servicios públicos", "Luz + agua del mes", 280_000, 7, "TRANSFERENCIA"},
        {"Insumos", "Compra de productos para reventa", 450_000, 12, "EFECTIVO"},
        {"Marketing", "Pauta en Instagram", 200_000, 15, "TARJETA"},
        {"Nómina", "Pago quincena - Juan", 750_000, 1, "TRANSFERENCIA"},
        {"Nómina", "Pago quincena - Andrés", 700_000, 1, "TRANSFERENCIA"},
    };
    for (Object[] e : expenses) {
      em.createNativeQuery(
          "INSERT INTO expenses (id, tenant_id, category_id, description, amount, " +
              "payment_method, expense_date, created_at) " +
              "VALUES (?1, ?2, ?3, ?4, ?5, ?6, " +
              "(now() - (?7 || ' days')::interval)::date, " +
              "now() - (?7 || ' days')::interval)")
          .setParameter(1, UUID.randomUUID())
          .setParameter(2, tenantId)
          .setParameter(3, catIds.get(e[0]))
          .setParameter(4, e[1])
          .setParameter(5, new BigDecimal(e[2].toString()))
          .setParameter(6, e[4])
          .setParameter(7, e[3])
          .executeUpdate();
    }
  }

  // ─── 11) Meta del mes ──────────────────────────────────────────────

  private void createMonthlyGoal(UUID tenantId) {
    LocalDate today = LocalDate.now();
    em.createNativeQuery(
        "INSERT INTO monthly_goals (id, tenant_id, period_year, period_month, " +
            "revenue_target, orders_target, created_at, updated_at) " +
            "VALUES (?1, ?2, ?3, ?4, 5000000, 100, now(), now())")
        .setParameter(1, UUID.randomUUID())
        .setParameter(2, tenantId)
        .setParameter(3, today.getYear())
        .setParameter(4, today.getMonthValue())
        .executeUpdate();
  }
}
