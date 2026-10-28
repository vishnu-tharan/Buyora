package com.buyora.api.checkout;

import com.buyora.api.cart.CartSummaryResponse;
import java.util.List;

public record CheckoutPreviewResponse(
    CartSummaryResponse summary,
    List<String> paymentMethods,
    List<ShippingMethodResponse> shippingMethods) {}
