package com.koreventas.app.dashboard;

import com.koreventas.app.customer.Customer;
import com.koreventas.app.customer.CustomerRepository;
import com.koreventas.app.customer.CustomerTag;
import com.koreventas.app.dashboard.dto.ClienteEnfriandoseDTO;
import com.koreventas.app.dashboard.dto.CumpleanosDTO;
import com.koreventas.app.dashboard.dto.ProductoStockBajoDTO;
import com.koreventas.app.dashboard.dto.PulsoDTO;
import com.koreventas.app.product.Product;
import com.koreventas.app.product.ProductRepository;
import com.koreventas.app.sale.SaleRepository;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

  private final SaleRepository sales;
  private final CustomerRepository customers;
  private final ProductRepository products;

  @PersistenceContext
  private EntityManager em;

  public DashboardService(SaleRepository sales,
                          CustomerRepository customers,
                          ProductRepository products) {
    this.sales = sales;
    this.customers = customers;
    this.products = products;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public PulsoDTO obtenerPulso() {
    applyTenant();
    UUID tenantId = TenantContext.get();

    // ── 1. Ventas hoy vs ayer ───────────────────────────────────────
    OffsetDateTime startOfToday = LocalDate.now().atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    OffsetDateTime endOfToday = startOfToday.plusDays(1);
    OffsetDateTime startOfYesterday = startOfToday.minusDays(1);

    BigDecimal ventasHoy = nullToZero(
        sales.sumSalesByTenantAndDateRange(tenantId, startOfToday, endOfToday));
    BigDecimal ventasAyer = nullToZero(
        sales.sumSalesByTenantAndDateRange(tenantId, startOfYesterday, startOfToday));
    BigDecimal variacionVentasPct = calcVariacionPct(ventasHoy, ventasAyer);

    long ordenesHoy = sales.countSalesByTenantAndDateRange(tenantId, startOfToday, endOfToday);

    // ── 2. Ticket promedio semana vs semana anterior ────────────────
    LocalDate today = LocalDate.now();
    LocalDate startCurrentWeek = today.with(DayOfWeek.MONDAY);
    LocalDate startPrevWeek = startCurrentWeek.minusWeeks(1);

    OffsetDateTime curWeekFrom = startCurrentWeek.atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    OffsetDateTime curWeekTo = endOfToday;  // desde lunes hasta ahora
    OffsetDateTime prevWeekFrom = startPrevWeek.atTime(LocalTime.MIN).atOffset(ZoneOffset.UTC);
    OffsetDateTime prevWeekTo = curWeekFrom;

    BigDecimal ventasSemana = nullToZero(
        sales.sumSalesByTenantAndDateRange(tenantId, curWeekFrom, curWeekTo));
    long ordenesSemana = sales.countSalesByTenantAndDateRange(tenantId, curWeekFrom, curWeekTo);
    BigDecimal ticketSemana = ordenesSemana == 0
        ? BigDecimal.ZERO
        : ventasSemana.divide(BigDecimal.valueOf(ordenesSemana), 2, RoundingMode.HALF_UP);

    BigDecimal ventasSemanaAnt = nullToZero(
        sales.sumSalesByTenantAndDateRange(tenantId, prevWeekFrom, prevWeekTo));
    long ordenesSemanaAnt = sales.countSalesByTenantAndDateRange(tenantId, prevWeekFrom, prevWeekTo);
    BigDecimal ticketSemanaAnt = ordenesSemanaAnt == 0
        ? BigDecimal.ZERO
        : ventasSemanaAnt.divide(BigDecimal.valueOf(ordenesSemanaAnt), 2, RoundingMode.HALF_UP);

    BigDecimal variacionTicketPct = calcVariacionPct(ticketSemana, ticketSemanaAnt);

    // ── 3. Clientes enfriándose (top 3 INACTIVO por ticket gastado) ─
    List<Customer> topInactivos = customers.findTopInactivos(PageRequest.of(0, 3));
    List<ClienteEnfriandoseDTO> clientesEnfriandose = topInactivos.stream()
        .map(c -> new ClienteEnfriandoseDTO(
            c.getId(),
            c.getFullName(),
            c.getPhone(),
            c.daysSinceLastVisit()))
        .toList();
    int totalInactivos = (int) customers.countByAutoTag(CustomerTag.INACTIVO);

    // ── 4. Productos con stock bajo ─────────────────────────────────
    List<Product> stockBajo = products.findActivosConStockBajo();
    List<ProductoStockBajoDTO> productosStockBajo = stockBajo.stream()
        .limit(5)
        .map(p -> new ProductoStockBajoDTO(p.getId(), p.getName(), p.getStock(), p.getStockAlert()))
        .toList();
    int totalStockBajo = (int) products.countActivosConStockBajo();

    // ── 5. Cumpleaños de la semana ──────────────────────────────────
    List<CumpleanosDTO> cumpleanos = buscarCumpleanosSemana(today);

    return new PulsoDTO(
        ventasHoy, ventasAyer, variacionVentasPct,
        ticketSemana, ticketSemanaAnt, variacionTicketPct,
        ordenesHoy,
        clientesEnfriandose, totalInactivos,
        productosStockBajo, totalStockBajo,
        cumpleanos
    );
  }

  private List<CumpleanosDTO> buscarCumpleanosSemana(LocalDate today) {
    LocalDate weekStart = today.with(DayOfWeek.MONDAY);
    LocalDate weekEnd = weekStart.plusDays(6);
    DateTimeFormatter mmdd = DateTimeFormatter.ofPattern("MM-dd");

    List<Customer> matches;
    // Caso borde: la semana cruza el año (ej. 29-dic a 4-ene)
    if (weekStart.getYear() != weekEnd.getYear()) {
      List<Customer> partA = customers.findCumpleanosEntre(weekStart.format(mmdd), "12-31");
      List<Customer> partB = customers.findCumpleanosEntre("01-01", weekEnd.format(mmdd));
      matches = new java.util.ArrayList<>(partA);
      matches.addAll(partB);
    } else {
      matches = customers.findCumpleanosEntre(weekStart.format(mmdd), weekEnd.format(mmdd));
    }

    return matches.stream()
        .map(c -> new CumpleanosDTO(c.getId(), c.getFullName(), c.getPhone(), c.getBirthday()))
        .toList();
  }

  private BigDecimal nullToZero(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }

  /** Variación porcentual (actual vs previo). Si previo es 0: devuelve 0 para evitar división por cero. */
  private BigDecimal calcVariacionPct(BigDecimal actual, BigDecimal previo) {
    if (previo == null || previo.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO;
    }
    return actual.subtract(previo)
        .multiply(BigDecimal.valueOf(100))
        .divide(previo, 1, RoundingMode.HALF_UP);
  }

}
