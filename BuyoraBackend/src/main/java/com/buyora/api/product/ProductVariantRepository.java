package com.buyora.api.product;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
  Optional<ProductVariant> findByPublicId(UUID publicId);
}
