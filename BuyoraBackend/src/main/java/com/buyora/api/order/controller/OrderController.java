package com.buyora.api.order.controller;

import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final com.buyora.api.common.security.CurrentUser currentUser;
    
    private Long getUserId() {
        return currentUser.requireId();
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getUserOrders(@RequestParam(required=false) com.buyora.api.order.entity.OrderStatus status, @RequestParam(required=false) String q, Pageable pageable) {
        return ResponseEntity.ok(orderService.getUserOrders(getUserId(), status, q, pageable));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String orderNumber, @CookieValue(name="buyora_guest_cart", required=false) String guestId) {
        return ResponseEntity.ok(orderService.getOrder(orderNumber, currentUser.optionalId(), guestId));
    }

    public record CancelRequest(@jakarta.validation.constraints.Size(max=1000) String reason) {}

    @PostMapping("/{orderNumber}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable String orderNumber,
            @jakarta.validation.Valid @RequestBody CancelRequest request) {
        return ResponseEntity.ok(orderService.cancelOrder(orderNumber, getUserId(), request.reason()));
    }
}
