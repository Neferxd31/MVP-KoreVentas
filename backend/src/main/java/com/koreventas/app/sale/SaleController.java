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
import org.springframework.web.bind.annotation.RestController;

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