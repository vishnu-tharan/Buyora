package com.buyora.api.inventory;

public record InventoryResponse(
    Long variantId,
    Integer stockQuantity,
    Integer reservedQuantity,
    Integer availableQuantity,
    Integer lowStockThreshold) {}
