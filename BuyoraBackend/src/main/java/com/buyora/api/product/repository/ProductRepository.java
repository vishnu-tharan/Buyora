package com.buyora.api.product.repository;

import com.buyora.api.category.entity.Category;
import com.buyora.api.product.entity.Product;
import com.buyora.api.product.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    Optional<Product> findBySlug(String slug);
    Optional<Product> findByPublicId(UUID publicId);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    
    List<Product> findTop8ByStatusAndFeaturedTrueOrderByCreatedAtDesc(ProductStatus status);
    List<Product> findTop8ByStatusAndNewArrivalTrueOrderByCreatedAtDesc(ProductStatus status);
    List<Product> findTop8ByStatusAndBestSellerTrueOrderByCreatedAtDesc(ProductStatus status);
    
    Page<Product> findAllByCategoryAndStatus(Category category, ProductStatus status, Pageable pageable);
    
    @Query("""
        SELECT p FROM Product p
        WHERE p.status = 'ACTIVE'
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:brandId IS NULL OR p.brand.id = :brandId)
        AND (:minPrice IS NULL OR EXISTS (
            SELECT v FROM ProductVariant v WHERE v.product = p 
            AND v.active = true AND v.price >= :minPrice))
        AND (:maxPrice IS NULL OR EXISTS (
            SELECT v FROM ProductVariant v WHERE v.product = p 
            AND v.active = true AND v.price <= :maxPrice))
        """)
    Page<Product> searchProducts(Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
}
