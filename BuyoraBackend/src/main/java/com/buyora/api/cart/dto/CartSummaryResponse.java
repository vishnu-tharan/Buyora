package com.buyora.api.cart.dto;

import java.math.BigDecimal;

public record CartSummaryResponse(
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal shippingAmount,
    BigDecimal taxAmount,
    BigDecimal total,
    String couponCode,
    boolean freeShipping
) {}
