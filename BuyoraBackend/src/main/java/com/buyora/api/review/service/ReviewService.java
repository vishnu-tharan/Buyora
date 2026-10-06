package com.buyora.api.review.service;

import com.buyora.api.common.exception.BusinessException;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.product.entity.Product;
import com.buyora.api.product.repository.ProductRepository;
import com.buyora.api.review.dto.CreateReviewRequest;
import com.buyora.api.review.dto.ReviewResponse;
import com.buyora.api.review.entity.Review;
import com.buyora.api.review.repository.ReviewRepository;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final ProductRepository productRepository;
  private final UserRepository userRepository;
  private final OrderRepository orderRepository;
  private final org.springframework.jdbc.core.JdbcTemplate jdbc;

  @Transactional(readOnly = true)
  public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
    return reviewRepository
        .findByProductIdAndStatus(productId, "APPROVED", pageable)
        .map(this::response);
  }

  @Transactional
  public ReviewResponse createReview(Long productId, Long userId, CreateReviewRequest request) {
    Product product =
        productRepository
            .findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (reviewRepository.existsByProductIdAndUserId(product.getId(), user.getId())) {
      throw new BusinessException("REVIEW_EXISTS", "User has already reviewed this product");
    }

    // Determine isVerified by checking if OrderRepository has an order from this user containing
    // the product with status DELIVERED
    boolean isVerified = checkVerifiedPurchase(user.getId(), product.getId());

    Review review =
        Review.builder()
            .product(product)
            .user(user)
            .rating(request.getRating())
            .title(request.getTitle())
            .comment(request.getComment())
            .isVerified(isVerified)
            .build();

    review = reviewRepository.saveAndFlush(review);
    if (request.getImages() != null && !request.getImages().isEmpty()) {
      if (!isVerified)
        throw new BusinessException(
            "PURCHASE_REQUIRED", "Customer photos require a delivered purchase");
      for (String url : new java.util.LinkedHashSet<>(request.getImages())) {
        java.util.UUID asset = java.util.UUID.fromString(url.substring(7));
        Integer owned =
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM media_assets WHERE id=? AND owner_id=? AND NOT public_asset",
                Integer.class,
                asset,
                userId);
        if (owned == null || owned != 1)
          throw new BusinessException("INVALID_PHOTO", "Choose photos you uploaded");
        jdbc.update(
            "INSERT INTO review_photos(review_id,asset_id) VALUES (?,?)", review.getId(), asset);
      }
    }

    return response(review);
  }

  @Transactional(readOnly = true)
  public Page<ReviewResponse> getMyReviews(Long userId, Pageable pageable) {
    return reviewRepository.findByUserId(userId, pageable).map(this::response);
  }

  private ReviewResponse response(Review review) {
    return ReviewResponse.builder()
        .id(review.getId())
        .productId(review.getProduct().getId())
        .user(
            java.util.Map.of(
                "id",
                review.getUser().getId(),
                "firstName",
                review.getUser().getFirstName(),
                "lastName",
                review.getUser().getLastName()))
        .images(
            jdbc.queryForList(
                "SELECT \'/media/\'||asset_id FROM review_photos WHERE review_id=? ORDER BY"
                    + " asset_id",
                String.class,
                review.getId()))
        .rating(review.getRating())
        .title(review.getTitle())
        .body(review.getComment())
        .isVerifiedPurchase(Boolean.TRUE.equals(review.getIsVerified()))
        .status(review.getStatus())
        .createdAt(review.getCreatedAt())
        .build();
  }

  @Transactional(readOnly = true)
  public Page<ReviewResponse> getAll(String status, Pageable pageable) {
    return (status == null || status.isBlank()
            ? reviewRepository.findAll(pageable)
            : reviewRepository.findByStatus(status, pageable))
        .map(this::response);
  }

  @Transactional
  public ReviewResponse moderate(Long id, String status) {
    if (!java.util.Set.of("APPROVED", "REJECTED").contains(status))
      throw new IllegalArgumentException("Invalid review status");
    Review review =
        reviewRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    var product = productRepository.findForUpdate(review.getProduct().getId()).orElseThrow();
    review.setStatus(status);
    reviewRepository.saveAndFlush(review);
    product.setReviewCount(
        Math.toIntExact(reviewRepository.countByProductIdAndStatus(product.getId(), "APPROVED")));
    Double average = reviewRepository.averageRating(product.getId());
    product.setAverageRating(java.math.BigDecimal.valueOf(average == null ? 0 : average));
    return response(review);
  }

  private boolean checkVerifiedPurchase(Long userId, Long productId) {
    return orderRepository.hasDeliveredProduct(userId, productId);
  }
}
