package com.buyora.api.order.entity;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAYMENT_CONFIRMED,
    PROCESSING,
    PACKED,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    RETURN_REQUESTED,
    RETURNED,
    REFUNDED
}