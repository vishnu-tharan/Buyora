package com.buyora.api.inventory.dto;

import jakarta.validation.constraints.NotNull;

public record InventoryAdjustRequest(
    @NotNull(message = "Quantity is required")
    Integer quantity,
    @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=1000) String reason
) {}
