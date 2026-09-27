package com.buyora.api.product.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record VariantSummaryResponse(
    UUID publicId,
    String sku,
    BigDecimal price,
    BigDecimal compareAtPrice,
    boolean active
) {}
