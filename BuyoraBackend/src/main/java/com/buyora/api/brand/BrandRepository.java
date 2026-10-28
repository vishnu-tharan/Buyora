package com.buyora.api.brand;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
  Optional<Brand> findBySlug(String slug);

  Optional<Brand> findByPublicId(UUID publicId);

  Page<Brand> findAllByActiveTrueOrderBySortOrderAsc(Pageable pageable);

  boolean existsBySlug(String slug);
}
