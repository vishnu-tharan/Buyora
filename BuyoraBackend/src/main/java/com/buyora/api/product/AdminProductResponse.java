package com.buyora.api.product;

import com.buyora.api.brand.BrandResponse;
import com.buyora.api.category.CategoryResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AdminProductResponse(
    Long id,
    UUID publicId,
    String name,
    String slug,
    String shortDescription,
    String description,
    CategoryResponse category,
    BrandResponse brand,
    ProductStatus status,
    boolean featured,
    boolean newArrival,
    boolean bestSeller,
    List<String> tags,
    String seoTitle,
    String seoDescription,
    BigDecimal averageRating,
    int reviewCount,
    String specifications,
    String shippingInfo,
    String returnInfo,
    List<ProductImageResponse> images,
    List<AdminVariantResponse> variants) {}
