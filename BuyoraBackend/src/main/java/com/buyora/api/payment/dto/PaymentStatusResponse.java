package com.buyora.api.payment.dto;

import java.util.UUID;

public record PaymentStatusResponse(
    UUID paymentId,
    String status,
    String orderNumber
) {}
