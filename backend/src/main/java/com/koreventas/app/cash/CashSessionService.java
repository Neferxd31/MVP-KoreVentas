package com.koreventas.app.cash;

import com.koreventas.app.cash.dto.CloseCashSessionRequest;
import com.koreventas.app.cash.dto.OpenCashSessionRequest;
import com.koreventas.app.sale.SaleRepository;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CashSessionService {

  private final CashSessionRepository sessions;
  private final SaleRepository sales;

  @PersistenceContext
  private EntityManager em;

  public CashSessionService(CashSessionRepository sessions, SaleRepository sales) {
    this.sessions = sessions;
    this.sales = sales;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public Optional<CashSession> findOpen() {
    applyTenant();
    return sessions.findFirstByStatusOrderByOpenedAtDesc(CashSession.Status.ABIERTA);
  }

  @Transactional(readOnly = true)
  public List<CashSession> findAll() {
    applyTenant();
    return sessions.findAllByOrderByOpenedAtDesc();
  }

  /** Suma de ventas en efectivo desde que abrió la sesión hasta ahora. */
  @Transactional(readOnly = true)
  public BigDecimal cashSalesSinceOpen(CashSession session) {
    applyTenant();
    return sales.sumCashBetween(session.getOpenedAt(), OffsetDateTime.now());
  }

  @Transactional
  public CashSession open(OpenCashSessionRequest req, UUID userId) {
    applyTenant();
    UUID tenantId = TenantContext.get();

    // Si ya hay una sesión abierta, no se puede abrir otra
    sessions.findFirstByStatusOrderByOpenedAtDesc(CashSession.Status.ABIERTA)
        .ifPresent(s -> {
          throw new IllegalStateException("Ya hay una sesión de caja abierta");
        });

    CashSession session = new CashSession(tenantId, userId, req.openingAmount());
    return sessions.save(session);
  }

  @Transactional
  public CashSession close(UUID id, CloseCashSessionRequest req) {
    applyTenant();
    CashSession session = sessions.findById(id)
        .orElseThrow(() -> new IllegalStateException("Sesión no encontrada: " + id));
    if (session.getStatus() == CashSession.Status.CERRADA) {
      throw new IllegalStateException("La sesión ya está cerrada");
    }

    BigDecimal cashSales = sales.sumCashBetween(session.getOpenedAt(), OffsetDateTime.now());
    BigDecimal expected = session.getOpeningAmount().add(cashSales);

    session.close(req.countedAmount(), expected, req.notes());
    return sessions.save(session);
  }
}
