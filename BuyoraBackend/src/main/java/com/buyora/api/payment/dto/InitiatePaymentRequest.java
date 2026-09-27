package com.buyora.api.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record InitiatePaymentRequest(
    @NotBlank
    String orderNumber,
    
    @NotBlank
    @Pattern(regexp = "^(PAYHERE|STRIPE|CASH_ON_DELIVERY)$", message = "Invalid payment method")
    String paymentMethod
) {}
