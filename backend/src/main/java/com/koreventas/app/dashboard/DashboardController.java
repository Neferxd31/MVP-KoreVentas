package com.koreventas.app.dashboard;

import com.koreventas.app.dashboard.dto.PulsoDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

  private final DashboardService service;

  public DashboardController(DashboardService service) {
    this.service = service;
  }

  @GetMapping("/pulso")
  public PulsoDTO pulso() {
    return service.obtenerPulso();
  }
}
