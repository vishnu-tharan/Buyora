package com.buyora.api.product.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;

public record ProductFilterRequest(
    @jakarta.validation.constraints.Size(max = 200) String q,
    String categorySlug,
    List<String> brandSlugs,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    Integer minRating,
    Boolean inStock,
    Boolean hasDiscount,
    String sort,
    @Min(0) Integer page,
    @Max(100) @Min(1) Integer size,
    java.util.List<String> attribute) {
  public ProductFilterRequest(
      String q,
      String categorySlug,
      List<String> brandSlugs,
      BigDecimal minPrice,
      BigDecimal maxPrice,
      Integer minRating,
      Boolean inStock,
      Boolean hasDiscount,
      String sort,
      Integer page,
      Integer size) {
    this(
        q,
        categorySlug,
        brandSlugs,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        hasDiscount,
        sort,
        page,
        size,
        null);
  }
}
