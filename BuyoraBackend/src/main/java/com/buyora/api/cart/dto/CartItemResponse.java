package com.buyora.api.cart.dto;

import java.math.BigDecimal;
import java.util.Map;

public record CartItemResponse(
    Long id,
    ProductInfo product,
    VariantInfo variant,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal totalPrice,
    BigDecimal discountAmount
) {
    public record ProductInfo(Long id, String name, String slug, ImageInfo primaryImage) {}
    public record ImageInfo(String url, String altText) {}
    public record VariantInfo(Long id, String sku, Map<String, String> attributes, BigDecimal price, int availableQuantity) {}
}
