package com.buyora.api.common.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class OrderPlacedEvent {
    private final UUID orderId;
    private final String orderNumber;
    private final String userEmail;
}
