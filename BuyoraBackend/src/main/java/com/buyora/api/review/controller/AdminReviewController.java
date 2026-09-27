package com.buyora.api.review.controller;
import com.buyora.api.review.service.ReviewService;
import com.buyora.api.review.dto.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
@RestController @RequestMapping("/api/v1/admin/reviews") @RequiredArgsConstructor
public class AdminReviewController {
    private final ReviewService reviews;
    public record StatusRequest(@jakarta.validation.constraints.NotBlank String status) {}
    @GetMapping public Page<ReviewResponse> list(@RequestParam(required=false) String status, Pageable pageable) { return reviews.getAll(status, pageable); }
    @PatchMapping("/{id}/status") public ReviewResponse moderate(@PathVariable Long id, @jakarta.validation.Valid @RequestBody StatusRequest request) { return reviews.moderate(id, request.status()); }
}
