package com.buyora.api.review;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {
  private final ReviewService reviews;

  public record StatusRequest(@jakarta.validation.constraints.NotBlank String status) {}

  @GetMapping
  public Page<ReviewResponse> list(
      @RequestParam(required = false) String status, Pageable pageable) {
    return reviews.getAll(status, pageable);
  }

  @PatchMapping("/{id}/status")
  public ReviewResponse moderate(
      @PathVariable Long id, @jakarta.validation.Valid @RequestBody StatusRequest request) {
    return reviews.moderate(id, request.status());
  }
}
