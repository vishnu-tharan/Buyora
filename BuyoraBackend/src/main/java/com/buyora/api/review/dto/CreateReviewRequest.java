package com.buyora.api.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @jakarta.validation.constraints.Size(max = 200)
    private String title;
    @NotBlank
    @jakarta.validation.constraints.Size(max = 5000)
    @com.fasterxml.jackson.annotation.JsonAlias("body")
    private String comment;
}
