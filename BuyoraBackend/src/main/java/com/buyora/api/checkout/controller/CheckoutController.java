package com.buyora.api.checkout.controller;

import com.buyora.api.checkout.dto.CheckoutPreviewResponse;
import com.buyora.api.checkout.dto.InitiateCheckoutRequest;
import com.buyora.api.checkout.service.CheckoutService;
import com.buyora.api.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final com.buyora.api.user.repository.UserRepository userRepository;

    private String getGuestId(String guestId) {
        return guestId != null ? guestId : UUID.randomUUID().toString();
    }
    
    private Long getUserId() {
        return com.buyora.api.auth.security.SecurityUtils.getCurrentUserEmailOptional()
            .flatMap(userRepository::findByEmail)
            .map(com.buyora.api.user.entity.User::getId)
            .orElse(null);
    }

    @PostMapping("/preview")
    public ResponseEntity<CheckoutPreviewResponse> previewCheckout(
            @CookieValue(name = "buyora_guest_cart", required = false) String guestId) {
        return ResponseEntity.ok(checkoutService.previewCheckout(getGuestId(guestId), getUserId()));
    }

    @PostMapping("/place-order")
    public ResponseEntity<OrderResponse> placeOrder(
            @CookieValue(name = "buyora_guest_cart", required = false) String guestId,
            @jakarta.validation.Valid @RequestBody InitiateCheckoutRequest request) {
        return ResponseEntity.ok(checkoutService.placeOrder(getGuestId(guestId), getUserId(), request));
    }
}
