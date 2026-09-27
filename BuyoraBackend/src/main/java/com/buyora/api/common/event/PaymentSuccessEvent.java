package com.buyora.api.common.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class PaymentSuccessEvent {
    private final UUID orderId;
    private final String paymentReference;
}
