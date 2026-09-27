package com.buyora.api.review.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long productId;
    private java.util.Map<String, Object> user;
    private String body;
    private boolean isVerifiedPurchase;
    private String status;
    private Integer rating;
    private String title;
    private String comment;
    private Boolean isVerified;
    private String reviewerName;
    private OffsetDateTime createdAt;
}
