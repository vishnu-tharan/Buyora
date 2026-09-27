package com.buyora.api.checkout.dto;

import com.buyora.api.cart.dto.CartSummaryResponse;
import java.util.List;

public record CheckoutPreviewResponse(
    CartSummaryResponse summary,
    List<String> paymentMethods,
    List<ShippingMethodResponse> shippingMethods
) {}
