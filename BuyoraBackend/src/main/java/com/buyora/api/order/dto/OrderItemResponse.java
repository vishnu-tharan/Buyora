package com.buyora.api.order.dto;
import java.math.BigDecimal;
import java.util.Map;
public record OrderItemResponse(Long id, ProductSnapshot product, VariantSnapshot variant, BigDecimal unitPrice,
        int quantity, BigDecimal totalPrice, BigDecimal discountAmount) {
    public record ProductSnapshot(Long id, String name, String slug) {}
    public record VariantSnapshot(Long id, String sku, Map<String, String> attributes) {}
}
