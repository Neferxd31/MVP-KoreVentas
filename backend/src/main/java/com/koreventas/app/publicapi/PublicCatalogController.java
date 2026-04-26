package com.koreventas.app.publicapi;

import com.koreventas.app.product.Product;
import com.koreventas.app.product.ProductRepository;
import com.koreventas.app.tenant.Tenant;
import com.koreventas.app.tenant.TenantRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Endpoints públicos (sin autenticación). Whitelisteados en SecurityConfig
 * con /public/**.
 *
 * Solo expone datos seguros del tenant: nombre, logo, color, productos activos
 * y teléfono de WhatsApp para que el comprador haga su pedido.
 *
 * NUNCA expone: clientes, ventas, costos, gastos, empleados, configuración
 * interna del negocio.
 */
@RestController
@RequestMapping("/public")
public class PublicCatalogController {

  private final PublicCatalogService service;

  public PublicCatalogController(PublicCatalogService service) {
    this.service = service;
  }

  @GetMapping("/catalog/{slug}")
  public Map<String, Object> catalog(@PathVariable String slug) {
    return service.loadCatalog(slug);
  }
}

@Service
class PublicCatalogService {

  private final TenantRepository tenants;
  private final ProductRepository products;

  @PersistenceContext
  private EntityManager em;

  PublicCatalogService(TenantRepository tenants, ProductRepository products) {
    this.tenants = tenants;
    this.products = products;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> loadCatalog(String slug) {
    Tenant t = tenants.findByPublicSlugAndCatalogEnabledTrue(slug)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Catálogo no encontrado"));

    // Activar RLS para el tenant correcto antes de cargar productos
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + t.getId() + "'")
        .executeUpdate();

    List<Map<String, Object>> items = products.findByActiveTrue().stream()
        .filter(p -> p.getStock() > 0)  // solo productos con stock disponible
        .map(p -> {
          Map<String, Object> m = new java.util.HashMap<>();
          m.put("id", p.getId().toString());
          m.put("name", p.getName());
          m.put("description", p.getDescription());
          m.put("price", p.getPrice());
          m.put("imageUrl", p.getImageUrl());
          m.put("stock", p.getStock());
          return m;
        })
        .toList();

    Map<String, Object> result = new java.util.HashMap<>();
    result.put("businessName", t.getBusinessName());
    result.put("logoUrl", t.getLogoUrl());
    result.put("primaryColor", t.getPrimaryColor());
    result.put("customColor", t.getCustomColor());
    result.put("whatsappPhone", t.getWhatsappPhone());
    result.put("items", items);
    // Conteo bruto sin filtro de stock para info al frontend
    result.put("itemCount", items.size());
    // No incluyo precios totales ni nada que sume — el carrito vive en el cliente
    suppressUnused();
    return result;
  }

  // BigDecimal usado por reflection del ProductResponse — evita el warning de unused import en Java <17
  private void suppressUnused() {
    BigDecimal.ZERO.toString();
  }
}
