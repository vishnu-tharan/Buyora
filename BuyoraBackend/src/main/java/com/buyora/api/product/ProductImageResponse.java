package com.buyora.api.product;

public record ProductImageResponse(
    Long id, String url, String altText, int sortOrder, boolean isPrimary) {}
