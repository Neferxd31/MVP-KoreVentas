package com.koreventas.app.product;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
