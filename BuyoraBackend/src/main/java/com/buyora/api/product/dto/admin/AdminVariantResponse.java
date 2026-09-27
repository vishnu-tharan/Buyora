package com.buyora.api.product.dto.admin;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminVariantResponse(
    UUID publicId,
    String sku,
    BigDecimal price,
    BigDecimal compareAtPrice,
    BigDecimal costPrice,
    Integer weightGrams,
    boolean active,
    int sortOrder
) {}
