package com.buyora.api.inventory.controller;

import com.buyora.api.inventory.dto.InventoryAdjustRequest;
import com.buyora.api.inventory.dto.InventoryResponse;
import com.buyora.api.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping public org.springframework.data.domain.Page<java.util.Map<String, Object>> list(org.springframework.data.domain.Pageable pageable) { return inventoryService.list(pageable); }

    @PostMapping("/variants/{variantId}/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> adjustStock(
            @PathVariable Long variantId,
            @Valid @RequestBody InventoryAdjustRequest request) {
        
        InventoryResponse response = inventoryService.adjustStock(
                variantId, 
                request.quantity(), 
                request.reason());
                
        return ResponseEntity.ok(response);
    }
}
