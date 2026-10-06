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

  @jakarta.validation.constraints.Size(max = 5)
  private java.util.List<
          @jakarta.validation.constraints.Pattern(regexp = "/media/[0-9a-fA-F-]{36}") String>
      images;

  @NotBlank
  @jakarta.validation.constraints.Size(max = 5000)
  @com.fasterxml.jackson.annotation.JsonAlias("body")
  private String comment;
}
