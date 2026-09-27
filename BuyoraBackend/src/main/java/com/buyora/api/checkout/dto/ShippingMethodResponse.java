package com.buyora.api.checkout.dto;

import java.math.BigDecimal;

public record ShippingMethodResponse(
    String id,
    String name,
    BigDecimal price,
    String estimatedDays
) {}
