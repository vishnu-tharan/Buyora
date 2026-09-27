package com.buyora.api.cart.service;
import com.buyora.api.cart.dto.*;
import java.util.UUID;

public interface CartService {
    CartResponse getCart(String guestId, Long userId);
    CartResponse addToCart(String guestId, Long userId, Long variantId, int quantity);
    CartResponse updateQuantity(String guestId, Long userId, Long itemId, int quantity);
    CartResponse removeCartItem(String guestId, Long userId, Long itemId);
    CartResponse clearCart(String guestId, Long userId);
    CartResponse applyCoupon(String guestId, Long userId, String couponCode);
    void mergeCart(String guestId, Long userId);
}
