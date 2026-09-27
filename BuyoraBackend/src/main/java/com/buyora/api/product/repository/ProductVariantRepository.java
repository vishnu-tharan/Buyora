package com.buyora.api.product.repository;

import com.buyora.api.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findByPublicId(UUID publicId);
}
