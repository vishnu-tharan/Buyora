package com.buyora.api.order.mapper;

import com.buyora.api.address.dto.AddressResponse;
import com.buyora.api.order.dto.OrderItemResponse;
import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.dto.OrderStatusHistoryResponse;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderItem;
import com.buyora.api.order.entity.OrderStatusHistory;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {
    private final com.fasterxml.jackson.databind.ObjectMapper json;
    public OrderMapper(com.fasterxml.jackson.databind.ObjectMapper json) { this.json = json; }
    public OrderResponse toResponse(Order order) {
        boolean canCancel = order.getStatus() == com.buyora.api.order.entity.OrderStatus.PENDING_PAYMENT;
        boolean canReturn = order.getStatus() == com.buyora.api.order.entity.OrderStatus.DELIVERED;
        
        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getPaymentStatus().name(),
            order.getPaymentMethod(),
            order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()),
            order.getItems().stream().mapToInt(OrderItem::getQuantity).sum(),
            shippingAddress(order),
            order.getSubtotal(),
            order.getDiscountAmount(),
            order.getShippingAmount(),
            order.getTaxAmount(),
            order.getTotal(),
            order.getCouponCode(),
            order.getDeliveryMethod(),
            order.getEstimatedDelivery(),
            order.getTrackingNumber(),
            order.getHistory().stream().map(this::toHistoryResponse).collect(Collectors.toList()),
            order.getCustomerNotes(),
            canCancel,
            canReturn,
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
    
    private AddressResponse shippingAddress(Order order) {
        try { return json.readValue(order.getShippingSnapshot(), AddressResponse.class); }
        catch (com.fasterxml.jackson.core.JsonProcessingException error) { throw new IllegalStateException("Order address requires reconciliation", error); }
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(item.getId(),
            new OrderItemResponse.ProductSnapshot(item.getProductId(), item.getProductName(), ""),
            new OrderItemResponse.VariantSnapshot(item.getVariantId(), item.getSku(), java.util.Map.of()),
            item.getPrice(), item.getQuantity(), item.getTotal(), java.math.BigDecimal.ZERO);
    }

    private OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
        return new OrderStatusHistoryResponse(
            history.getStatus().name(),
            history.getNotes(),
            history.getCreatedAt()
        );
    }
}