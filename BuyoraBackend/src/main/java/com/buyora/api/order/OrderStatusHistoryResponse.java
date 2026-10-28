package com.buyora.api.order;

import java.time.Instant;

public record OrderStatusHistoryResponse(String status, String note, Instant timestamp) {}
