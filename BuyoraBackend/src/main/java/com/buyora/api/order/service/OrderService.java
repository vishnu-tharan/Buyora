package com.buyora.api.order.service;

import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse getOrder(String orderNumber, Long userId, String guestId);
    Page<OrderResponse> getUserOrders(Long userId, OrderStatus status, String q, Pageable pageable);
    OrderResponse getAdminOrder(String orderNumber);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    OrderResponse updateOrderStatus(String orderNumber, OrderStatus newStatus, String notes);
    OrderResponse cancelOrder(String orderNumber, Long userId, String reason);
}