package com.buyora.api.review.controller;

import com.buyora.api.review.dto.CreateReviewRequest;
import com.buyora.api.review.dto.ReviewResponse;
import com.buyora.api.review.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getReviews(@PathVariable Long productId, Pageable pageable) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, pageable));
    }

    private final com.buyora.api.user.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateReviewRequest request) {
        String email = com.buyora.api.auth.security.SecurityUtils.getCurrentUserEmail();
        com.buyora.api.user.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.buyora.api.common.exception.ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(reviewService.createReview(productId, user.getId(), request));
    }
}
