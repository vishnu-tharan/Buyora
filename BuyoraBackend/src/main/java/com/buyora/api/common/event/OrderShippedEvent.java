package com.buyora.api.common.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class OrderShippedEvent {
    private final UUID orderId;
    private final String trackingNumber;
    private final String userEmail;
}
