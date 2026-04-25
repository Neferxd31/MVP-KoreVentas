package com.koreventas.app.sale;

import com.koreventas.app.sale.dto.CreateSaleRequest;
import com.koreventas.app.sale.dto.DashboardResumenDTO;
import com.koreventas.app.sale.dto.SaleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sales")
public class SaleController {

  private final SaleService service;

  public SaleController(SaleService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<SaleResponse> create(@Valid @RequestBody CreateSaleRequest req) {
    Sale sale = service.createSale(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(SaleResponse.from(sale));
  }

  @GetMapping("/today")
  public List<SaleResponse> today() {
    return service.findToday().stream().map(SaleResponse::from).toList();
  }

  /**
   * Historial de ventas con filtros opcionales.
   * - from / to: rango de fechas (yyyy-MM-dd). Default: últimos 30 días.
   * - customerId, productId, serviceId, paymentMethod: filtros opcionales.
   */
  @GetMapping
  public List<SaleResponse> search(
      @RequestParam(required = false) String from,
      @RequestParam(required = false) String to,
      @RequestParam(required = false) UUID customerId,
      @RequestParam(required = false) UUID productId,
      @RequestParam(required = false) UUID serviceId,
      @RequestParam(required = false) String paymentMethod
  ) {
    OffsetDateTime fromDt = parseStart(from);
    OffsetDateTime toDt = parseEnd(to);
    PaymentMethod method = paymentMethod != null && !paymentMethod.isBlank()
        ? PaymentMethod.valueOf(paymentMethod)
        : null;
    return service.searchSales(fromDt, toDt, customerId, method, productId, serviceId)
        .stream().map(SaleResponse::from).toList();
  }

  private OffsetDateTime parseStart(String d) {
    LocalDate ld = (d == null || d.isBlank())
        ? LocalDate.now().minusDays(30)
        : LocalDate.parse(d);
    return ld.atStartOfDay().atOffset(ZoneOffset.UTC);
  }

  private OffsetDateTime parseEnd(String d) {
    LocalDate ld = (d == null || d.isBlank()) ? LocalDate.now() : LocalDate.parse(d);
    return ld.atTime(23, 59, 59).atOffset(ZoneOffset.UTC);
  }

  @GetMapping("/{id}")
  public SaleResponse byId(@PathVariable UUID id) {
    return SaleResponse.from(service.findById(id));
  }

  @GetMapping("/customer/{customerId}")
  public List<SaleResponse> byCustomer(@PathVariable UUID customerId) {
    return service.findByCustomer(customerId).stream().map(SaleResponse::from).toList();
  }
  
  @GetMapping("/resumen")
  public DashboardResumenDTO resumen() {
    return service.obtenerResumenDashboard();
  }
}