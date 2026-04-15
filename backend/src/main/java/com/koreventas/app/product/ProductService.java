package com.koreventas.app.product;

import com.koreventas.app.product.dto.CreateProductRequest;
import com.koreventas.app.product.dto.UpdateProductRequest;
import com.koreventas.app.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

  private final ProductRepository products;
  private final CategoryRepository categories;

  @PersistenceContext
  private EntityManager em;

  public ProductService(ProductRepository products, CategoryRepository categories) {
    this.products = products;
    this.categories = categories;
  }

  private void applyTenant() {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) throw new IllegalStateException("No hay tenant en contexto");
    em.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
  }

  @Transactional(readOnly = true)
  public List<Product> findAll() {
    applyTenant();
    return products.findByActiveTrue();
  }

  @Transactional(readOnly = true)
  public List<Product> findFavorites() {
    applyTenant();
    return products.findByFavoriteTrue();
  }

  @Transactional(readOnly = true)
  public Product findById(UUID id) {
    applyTenant();
    return products.findById(id)
        .orElseThrow(() -> new ProductNotFoundException(id));
  }

  @Transactional(readOnly = true)
  public Product findByBarcode(String barcode) {
    applyTenant();
    return products.findByBarcode(barcode)
        .orElseThrow(() -> new ProductNotFoundException("Código de barras no encontrado: " + barcode));
  }

  @Transactional(readOnly = true)
  public List<Product> search(String query) {
    applyTenant();
    return products.findByNameContainingIgnoreCase(query);
  }

  @Transactional(readOnly = true)
  public List<Product> findLowStock() {
    applyTenant();
    // Productos cuyo stock actual está por debajo o igual a su umbral de alerta
    return products.findAll().stream()
        .filter(Product::isLowStock)
        .filter(Product::isActive)
        .toList();
  }

  @Transactional
  public Product create(CreateProductRequest req) {
    applyTenant();
    UUID tenantId = TenantContext.get();
    Product product = new Product(tenantId, req.name(), req.price(), req.taxRate());
    product.setDescription(req.description());
    product.setBarcode(req.barcode());
    product.setCost(req.cost());
    product.setStock(req.stock());
    product.setStockAlert(req.stockAlert() > 0 ? req.stockAlert() : 5);
    product.setImageUrl(req.imageUrl());
    product.setFavorite(req.favorite());
    if (req.categoryId() != null) {
      product.setCategoryId(req.categoryId());
    }
    return products.save(product);
  }

  @Transactional
  public Product update(UUID id, UpdateProductRequest req) {
    applyTenant();
    Product product = products.findById(id)
        .orElseThrow(() -> new ProductNotFoundException(id));

    if (req.name() != null) product.setName(req.name());
    if (req.description() != null) product.setDescription(req.description());
    if (req.barcode() != null) product.setBarcode(req.barcode());
    if (req.price() != null) product.setPrice(req.price());
    if (req.cost() != null) product.setCost(req.cost());
    if (req.taxRate() != null) product.setTaxRate(req.taxRate());
    if (req.stock() != null) product.setStock(req.stock());
    if (req.stockAlert() != null) product.setStockAlert(req.stockAlert());
    if (req.imageUrl() != null) product.setImageUrl(req.imageUrl());
    if (req.favorite() != null) product.setFavorite(req.favorite());
    if (req.active() != null) product.setActive(req.active());
    if (req.categoryId() != null) product.setCategoryId(req.categoryId());

    return products.save(product);
  }

  @Transactional
  public void delete(UUID id) {
    applyTenant();
    Product product = products.findById(id)
        .orElseThrow(() -> new ProductNotFoundException(id));
    // Soft delete: desactivar, no borrar
    product.setActive(false);
    products.save(product);
  }

  // ── Categorías ──────────────────────────────────────────

  @Transactional(readOnly = true)
  public List<Category> findAllCategories() {
    applyTenant();
    return categories.findAll();
  }

  @Transactional
  public Category createCategory(String name) {
    applyTenant();
    return categories.save(new Category(TenantContext.get(), name));
  }
}
