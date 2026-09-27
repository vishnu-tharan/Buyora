package com.buyora.api.product.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;

public record ProductFilterRequest(
    String q,
    String categorySlug,
    List<String> brandSlugs,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    Integer minRating,
    Boolean inStock,
    Boolean hasDiscount,
    String sort,
    @Min(0) Integer page,
    @Max(100) @Min(1) Integer size
) {}
