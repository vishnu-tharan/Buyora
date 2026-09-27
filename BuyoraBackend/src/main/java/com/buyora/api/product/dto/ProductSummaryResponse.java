package com.buyora.api.product.dto;

import com.buyora.api.brand.dto.BrandResponse;
import com.buyora.api.category.dto.CategoryResponse;
import com.buyora.api.product.entity.ProductStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductSummaryResponse(
    UUID publicId,
    String name,
    String slug,
    String shortDescription,
    BrandResponse brand,
    CategoryResponse category,
    ProductImageResponse primaryImage,
    BigDecimal basePrice,
    BigDecimal salePriceFrom,
    Integer discountPercentage,
    BigDecimal averageRating,
    int reviewCount,
    boolean inStock,
    ProductStatus status,
    List<VariantSummaryResponse> variants
) {}
