package com.buyora.api.product.dto;

public record ProductImageResponse(
    Long id,
    String url,
    String altText,
    int sortOrder,
    boolean isPrimary
) {}
