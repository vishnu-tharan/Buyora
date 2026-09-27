package com.buyora.api.review.controller;
import com.buyora.api.review.service.ReviewService;
import com.buyora.api.review.dto.ReviewResponse;
import com.buyora.api.common.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/account/reviews")
@RequiredArgsConstructor
public class AccountReviewController {
    private final ReviewService reviews;
    private final CurrentUser currentUser;
    @GetMapping public Page<ReviewResponse> list(Pageable pageable) { return reviews.getMyReviews(currentUser.requireId(), pageable); }
}
