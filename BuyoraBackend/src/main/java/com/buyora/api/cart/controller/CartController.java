package com.buyora.api.cart.controller;

import com.buyora.api.cart.dto.CartResponse;
import com.buyora.api.cart.service.CartService;
import com.buyora.api.cart.service.GuestCartIdentity;
import com.buyora.api.auth.security.SecurityUtils;
import com.buyora.api.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService carts;
    private final UserRepository users;
    private final GuestCartIdentity guests;
    public record AddItem(@NotNull Long variantId, @Min(1) @Max(100) int quantity) {}
    public record Quantity(@Min(1) @Max(100) int quantity) {}
    public record CouponCode(@NotBlank @Size(max=50) String code) {}

    private Long userId() {
        return SecurityUtils.getCurrentUserEmailOptional().flatMap(users::findByEmail).map(u -> u.getId()).orElse(null);
    }

    @GetMapping
    public CartResponse get(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response) {
        return carts.getCart(guests.resolve(guest, response), userId());
    }
    @PostMapping("/items")
    public CartResponse add(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response,
                            @Valid @RequestBody AddItem request) {
        return carts.addToCart(guests.resolve(guest, response), userId(), request.variantId(), request.quantity());
    }
    @PutMapping("/items/{itemId}")
    public CartResponse update(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response,
                               @PathVariable Long itemId, @Valid @RequestBody Quantity request) {
        return carts.updateQuantity(guests.resolve(guest, response), userId(), itemId, request.quantity());
    }
    @DeleteMapping("/items/{itemId}")
    public CartResponse remove(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response,
                               @PathVariable Long itemId) {
        return carts.removeCartItem(guests.resolve(guest, response), userId(), itemId);
    }
    @DeleteMapping("/clear")
    public CartResponse clear(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response) {
        return carts.clearCart(guests.resolve(guest, response), userId());
    }
    @PostMapping("/coupon")
    public CartResponse coupon(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response,
                               @Valid @RequestBody CouponCode request) {
        return carts.applyCoupon(guests.resolve(guest, response), userId(), request.code());
    }
    @DeleteMapping("/coupon")
    public CartResponse removeCoupon(@CookieValue(name="buyora_guest_cart", required=false) String guest, HttpServletResponse response) {
        return carts.applyCoupon(guests.resolve(guest, response), userId(), null);
    }
    @PostMapping("/merge")
    public CartResponse merge(@CookieValue(name="buyora_guest_cart", required=false) String guest) {
        Long user = userId();
        if (user == null) throw new com.buyora.api.common.exception.UnauthorizedException("Sign in required");
        carts.mergeCart(guest, user);
        return carts.getCart(null, user);
    }
}
