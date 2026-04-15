package com.koreventas.app.product;

import com.koreventas.app.product.dto.CreateProductRequest;
import com.koreventas.app.product.dto.ProductResponse;
import com.koreventas.app.product.dto.UpdateProductRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

  private final ProductService service;

  public ProductController(ProductService service) {
    this.service = service;
  }

  @GetMapping
  public List<ProductResponse> list() {
    return service.findAll().stream().map(ProductResponse::from).toList();
  }

  @GetMapping("/favorites")
  public List<ProductResponse> favorites() {
    return service.findFavorites().stream().map(ProductResponse::from).toList();
  }

  @GetMapping("/low-stock")
  public List<ProductResponse> lowStock() {
    return service.findLowStock().stream().map(ProductResponse::from).toList();
  }

  @GetMapping("/search")
  public List<ProductResponse> search(@RequestParam String q) {
    return service.search(q).stream().map(ProductResponse::from).toList();
  }

  @GetMapping("/barcode/{barcode}")
  public ProductResponse byBarcode(@PathVariable String barcode) {
    return ProductResponse.from(service.findByBarcode(barcode));
  }

  @GetMapping("/{id}")
  public ProductResponse byId(@PathVariable UUID id) {
    return ProductResponse.from(service.findById(id));
  }

  @PostMapping
  public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest req) {
    Product product = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(product));
  }

  @PatchMapping("/{id}")
  public ProductResponse update(@PathVariable UUID id,
                                @Valid @RequestBody UpdateProductRequest req) {
    return ProductResponse.from(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Producto desactivado"));
  }

  // ── Categorías ──────────────────────────────────────────

  @GetMapping("/categories")
  public List<Map<String, Object>> listCategories() {
    return service.findAllCategories().stream()
        .map(c -> Map.<String, Object>of("id", c.getId(), "name", c.getName()))
        .toList();
  }

  @PostMapping("/categories")
  public ResponseEntity<Map<String, Object>> createCategory(@RequestBody Map<String, String> body) {
    String name = body.get("name");
    if (name == null || name.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio"));
    }
    Category cat = service.createCategory(name);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of("id", cat.getId(), "name", cat.getName()));
  }
}
