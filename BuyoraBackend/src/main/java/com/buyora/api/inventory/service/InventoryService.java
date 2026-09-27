package com.buyora.api.inventory.service;

import com.buyora.api.inventory.dto.InventoryResponse;

import java.util.Map;

public interface InventoryService {
    org.springframework.data.domain.Page<java.util.Map<String, Object>> list(org.springframework.data.domain.Pageable pageable);
    InventoryResponse adjustStock(Long variantId, int quantity, String reason);
    void reserveStock(Map<Long, Integer> variantQuantities, String referenceId);
    void releaseStock(String referenceId);
    void confirmStock(String referenceId);
}
