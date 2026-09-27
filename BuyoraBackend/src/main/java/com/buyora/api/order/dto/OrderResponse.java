package com.buyora.api.order.dto;

import com.buyora.api.address.dto.AddressResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    Long id,
    String orderNumber,
    String status,
    String paymentStatus,
    String paymentMethod,
    List<OrderItemResponse> items,
    int itemCount,
    AddressResponse shippingAddress,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal shippingAmount,
    BigDecimal taxAmount,
    BigDecimal total,
    String couponCode,
    String deliveryMethod,
    Instant estimatedDelivery,
    String trackingNumber,
    List<OrderStatusHistoryResponse> timeline,
    String notes,
    boolean canCancel,
    boolean canReturn,
    Instant createdAt,
    Instant updatedAt
) {}