package com.koreventas.app.goal;

import com.koreventas.app.goal.dto.GoalProgressResponse;
import com.koreventas.app.goal.dto.UpsertGoalRequest;
import com.koreventas.app.sale.SaleRepository;
import com.koreventas.app.security.CurrentUser;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class MonthlyGoalService {

  private final MonthlyGoalRepository goals;
  private final SaleRepository sales;
  private final CurrentUser currentUser;

  @PersistenceContext
  private EntityManager em;

  public MonthlyGoalService(MonthlyGoalRepository goals, SaleRepository sales,
                            CurrentUser currentUser) {
    this.goals = goals;
    this.sales = sales;
    this.currentUser = currentUser;
  }

  private void applyTenant() {
    // Metas: solo ADMIN
    currentUser.requireAdmin();
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional
  public MonthlyGoal upsert(UpsertGoalRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();
    return goals.findByPeriodYearAndPeriodMonth(req.year(), req.month())
        .map(g -> {
          g.update(req.revenueTarget(), req.ordersTarget());
          return goals.save(g);
        })
        .orElseGet(() -> goals.save(new MonthlyGoal(
            tenantId, req.year(), req.month(),
            req.revenueTarget(), req.ordersTarget()
        )));
  }

  /** Progreso del mes en curso con proyección lineal por día transcurrido. */
  @Transactional(readOnly = true)
  public GoalProgressResponse currentProgress() {
    applyTenant();
    LocalDate today = LocalDate.now();
    YearMonth ym = YearMonth.from(today);
    return progressFor(ym.getYear(), ym.getMonthValue(), today);
  }

  @Transactional(readOnly = true)
  public GoalProgressResponse progressFor(int year, int month, LocalDate refDate) {
    applyTenant();
    UUID tenantId = TenantContext.get();
    YearMonth ym = YearMonth.of(year, month);
    int daysInMonth = ym.lengthOfMonth();
    int dayOfMonth = ym.equals(YearMonth.from(refDate)) ? refDate.getDayOfMonth() : daysInMonth;

    OffsetDateTime from = ym.atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
    OffsetDateTime to = ym.atEndOfMonth().atTime(23, 59, 59).atOffset(ZoneOffset.UTC);

    BigDecimal revenueSoFar = sales.sumSalesByTenantAndDateRange(tenantId, from, to);
    long ordersSoFar = sales.countSalesByTenantAndDateRange(tenantId, from, to);

    // Proyección lineal: (vendido / dia_actual) * total_dias_mes
    BigDecimal projected = BigDecimal.ZERO;
    if (dayOfMonth > 0) {
      projected = revenueSoFar
          .multiply(BigDecimal.valueOf(daysInMonth))
          .divide(BigDecimal.valueOf(dayOfMonth), 2, RoundingMode.HALF_UP);
    }

    var goalOpt = goals.findByPeriodYearAndPeriodMonth(year, month);
    BigDecimal revenueTarget = goalOpt.map(MonthlyGoal::getRevenueTarget).orElse(BigDecimal.ZERO);
    int ordersTarget = goalOpt.map(MonthlyGoal::getOrdersTarget).orElse(0);

    return new GoalProgressResponse(
        year, month,
        revenueTarget, ordersTarget,
        revenueSoFar, (int) ordersSoFar,
        dayOfMonth, daysInMonth,
        projected,
        goalOpt.isPresent()
    );
  }
}
