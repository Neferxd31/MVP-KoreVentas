package com.koreventas.app.dev;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoints de desarrollo / demo. Whitelisteados en /dev/**.
 * En producción real este controller debería estar detrás de un Spring Profile,
 * pero para el MVP lo dejamos accesible para facilitar las demos del cliente.
 */
@RestController
@RequestMapping("/dev")
public class DevSeedController {

  private final DemoSeederService seeder;

  public DevSeedController(DemoSeederService seeder) {
    this.seeder = seeder;
  }

  /**
   * Borra y recrea el tenant demo "Barbería El Capitán" con datos completos
   * para mostrar todas las features del sistema.
   *
   * Devuelve credenciales y URL del catálogo público.
   */
  @PostMapping("/seed-demo")
  public Map<String, Object> seedDemo() {
    return seeder.seedDemoTenant();
  }
}
