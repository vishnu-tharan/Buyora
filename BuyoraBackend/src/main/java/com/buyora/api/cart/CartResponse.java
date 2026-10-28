package com.buyora.api.cart;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CartResponse(
    UUID id,
    List<CartItemResponse> items,
    CartSummaryResponse summary,
    int itemCount,
    Instant createdAt,
    Instant updatedAt) {}
