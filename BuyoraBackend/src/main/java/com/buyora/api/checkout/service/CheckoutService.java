package com.buyora.api.checkout.service;

import com.buyora.api.checkout.dto.CheckoutPreviewResponse;
import com.buyora.api.checkout.dto.InitiateCheckoutRequest;
import com.buyora.api.order.dto.OrderResponse;

public interface CheckoutService {
    CheckoutPreviewResponse previewCheckout(String guestId, Long userId);
    OrderResponse placeOrder(String guestId, Long userId, InitiateCheckoutRequest request);
}