package com.koreventas.app.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

  List<Product> findByActiveTrue();

  List<Product> findByFavoriteTrue();

  Optional<Product> findByBarcode(String barcode);

  List<Product> findByNameContainingIgnoreCase(String name);

  List<Product> findByCategoryId(UUID categoryId);

  List<Product> findByStockLessThanEqual(int stockAlert);

  // Productos activos con stock <= stockAlert (compara columna contra columna)
  @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= p.stockAlert "
      + "ORDER BY p.stock ASC")
  List<Product> findActivosConStockBajo();

  @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.stock <= p.stockAlert")
  long countActivosConStockBajo();
}
