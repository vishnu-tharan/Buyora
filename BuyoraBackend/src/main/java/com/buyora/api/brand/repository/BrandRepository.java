package com.buyora.api.brand.repository;

import com.buyora.api.brand.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findBySlug(String slug);
    Optional<Brand> findByPublicId(UUID publicId);
    Page<Brand> findAllByActiveTrueOrderBySortOrderAsc(Pageable pageable);
    boolean existsBySlug(String slug);
}
