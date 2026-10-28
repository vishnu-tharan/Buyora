package com.buyora.api.payment;

import java.util.UUID;

public record PaymentStatusResponse(UUID paymentId, String status, String orderNumber) {}
