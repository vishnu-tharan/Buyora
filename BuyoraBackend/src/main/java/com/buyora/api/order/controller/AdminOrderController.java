package com.buyora.api.order.controller;

import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @GetMapping("/{orderNumber}") public OrderResponse detail(@PathVariable String orderNumber) { return orderService.getAdminOrder(orderNumber); }
    public record StatusRequest(@jakarta.validation.constraints.NotNull OrderStatus status, @jakarta.validation.constraints.Size(max=1000) String notes) {}
    @PatchMapping("/{orderNumber}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @jakarta.validation.Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderNumber, request.status(), request.notes()));
    }
}