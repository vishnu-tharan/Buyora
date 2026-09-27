package com.buyora.api.product.dto.admin;

import com.buyora.api.brand.dto.BrandResponse;
import com.buyora.api.category.dto.CategoryResponse;
import com.buyora.api.product.dto.ProductImageResponse;
import com.buyora.api.product.entity.ProductStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AdminProductResponse(
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
    List<AdminVariantResponse> variants
) {}
