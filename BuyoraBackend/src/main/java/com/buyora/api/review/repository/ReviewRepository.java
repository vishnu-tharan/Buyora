package com.buyora.api.review.repository;

import com.buyora.api.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByStatus(String status, Pageable pageable);
    Page<Review> findByProductIdAndStatus(Long productId, String status, Pageable pageable);
    Page<Review> findByUserId(Long userId, Pageable pageable);
    @org.springframework.data.jpa.repository.Query("select avg(r.rating) from Review r where r.product.id = :productId and r.status = 'APPROVED'")
    Double averageRating(@org.springframework.data.repository.query.Param("productId") Long productId);
    long countByProductIdAndStatus(Long productId, String status);
    Page<Review> findByProductSlug(String slug, Pageable pageable);
    Page<Review> findByProductId(Long productId, Pageable pageable);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
