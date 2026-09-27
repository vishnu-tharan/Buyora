package com.buyora.api.payment.dto;

import java.util.Map;
import java.util.UUID;

public record PaymentInitiationResponse(
    UUID paymentId,
    String paymentMethod,
    String redirectUrl,
    Map<String, String> formData,
    String clientSecret
) {}
