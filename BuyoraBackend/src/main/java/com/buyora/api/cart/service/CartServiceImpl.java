package com.buyora.api.cart.service;

import com.buyora.api.cart.dto.*;
import com.buyora.api.cart.entity.Cart;
import com.buyora.api.cart.entity.CartItem;
import com.buyora.api.cart.repository.CartItemRepository;
import com.buyora.api.cart.repository.CartRepository;
import com.buyora.api.coupon.entity.Coupon;
import com.buyora.api.coupon.repository.CouponRepository;
import com.buyora.api.product.entity.ProductVariant;
import com.buyora.api.product.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {
    
    private final com.buyora.api.coupon.service.CouponPricing couponPricing;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final ProductVariantRepository variantRepository;
    private final com.buyora.api.user.repository.UserRepository userRepository;
    private final com.buyora.api.inventory.repository.InventoryItemRepository inventoryItemRepository;

    public CartServiceImpl(com.buyora.api.coupon.service.CouponPricing couponPricing, CartRepository cartRepository, CartItemRepository cartItemRepository, CouponRepository couponRepository, ProductVariantRepository variantRepository, com.buyora.api.user.repository.UserRepository userRepository, com.buyora.api.inventory.repository.InventoryItemRepository inventoryItemRepository) {
        this.couponPricing = couponPricing;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.couponRepository = couponRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    private Cart getOrCreateCart(String guestId, Long userId) {
        if (userId != null) {
            userRepository.findForUpdate(userId).orElseThrow(() -> new com.buyora.api.common.exception.ResourceNotFoundException("User not found"));
            return cartRepository.findByUserId(userId).orElseGet(() -> {
                Cart cart = new Cart();
                cart.setUser(userRepository.getReferenceById(userId));
                return cartRepository.saveAndFlush(cart);
            });
        }
        if (guestId == null || guestId.isBlank()) throw new IllegalArgumentException("Guest session required");
        return cartRepository.findByGuestId(guestId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setGuestId(guestId);
            return cartRepository.saveAndFlush(cart);
        });
    }

    @Override
    public CartResponse getCart(String guestId, Long userId) {
        Cart cart = getOrCreateCart(guestId, userId);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse addToCart(String guestId, Long userId, Long variantId, int quantity) {
        if (quantity < 1 || quantity > 100) throw new IllegalArgumentException("Quantity must be between 1 and 100");
        Cart cart = getOrCreateCart(guestId, userId);
        ProductVariant variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new RuntimeException("Variant not found"));
            
        Optional<CartItem> existingItem = cart.getItems().stream()
            .filter(item -> item.getVariant().getId().equals(variant.getId()))
            .findFirst();
            
        if (!variant.isActive() || variant.getProduct().getStatus() != com.buyora.api.product.entity.ProductStatus.ACTIVE) throw new IllegalArgumentException("Product is unavailable");
        int currentQty = existingItem.map(CartItem::getQuantity).orElse(0);
        int requestedQty = Math.addExact(currentQty, quantity);
        if (requestedQty > 100) throw new IllegalArgumentException("Quantity cannot exceed 100");
        
        com.buyora.api.inventory.entity.InventoryItem inv = inventoryItemRepository.findByVariantId(variant.getId()).orElse(null);
        int stock = inv != null ? inv.getAvailableQuantity() : 0;
        
        if (requestedQty > stock) {
            throw new com.buyora.api.common.exception.BusinessException("INSUFFICIENT_STOCK", "Requested quantity exceeds available stock");
        }
            
        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(requestedQty);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }
        cartRepository.saveAndFlush(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse updateQuantity(String guestId, Long userId, Long variantId, int quantity) {
        Cart cart = getOrCreateCart(guestId, userId);
        cart.getItems().stream()
            .filter(item -> item.getId().equals(variantId))
            .findFirst()
            .ifPresent(item -> {
                if (quantity <= 0) {
                    cart.getItems().remove(item);
                    cartItemRepository.delete(item);
                } else {
                    com.buyora.api.inventory.entity.InventoryItem inv = inventoryItemRepository.findByVariantId(item.getVariant().getId()).orElse(null);
                    int stock = inv != null ? inv.getAvailableQuantity() : 0;
                    if (quantity > stock) {
                        throw new com.buyora.api.common.exception.BusinessException("INSUFFICIENT_STOCK", "Requested quantity exceeds available stock");
                    }
                    item.setQuantity(quantity);
                }
            });
        cartRepository.saveAndFlush(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse removeCartItem(String guestId, Long userId, Long variantId) {
        Cart cart = getOrCreateCart(guestId, userId);
        cart.getItems().removeIf(item -> {
            boolean matches = item.getId().equals(variantId);
            if (matches) cartItemRepository.delete(item);
            return matches;
        });
        cartRepository.saveAndFlush(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(String guestId, Long userId) {
        Cart cart = getOrCreateCart(guestId, userId);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.saveAndFlush(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse applyCoupon(String guestId, Long userId, String couponCode) {
        Cart cart = getOrCreateCart(guestId, userId);
        Coupon coupon = couponCode == null ? null : couponRepository.findByCode(couponCode).orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        cart.setCoupon(coupon);
        cartRepository.saveAndFlush(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public void mergeCart(String guestId, Long userId) {
        if (guestId == null || userId == null) return;
        Cart guestCart = cartRepository.findByGuestId(guestId).orElse(null);
        if (guestCart == null || guestCart.getItems().isEmpty()) return;
        
        Cart userCart = getOrCreateCart(null, userId);
        for (CartItem guestItem : guestCart.getItems()) {
            int existing = userCart.getItems().stream().filter(i -> i.getVariant().getId().equals(guestItem.getVariant().getId())).mapToInt(CartItem::getQuantity).sum();
            int quantity = Math.addExact(existing, guestItem.getQuantity());
            int available = inventoryItemRepository.findByVariantId(guestItem.getVariant().getId()).map(i -> i.getAvailableQuantity()).orElse(0);
            if (quantity < 1 || quantity > 100 || quantity > available || !guestItem.getVariant().isActive()) throw new com.buyora.api.common.exception.BusinessException("CART_MERGE_STOCK", "Guest cart quantities exceed available stock");
        }
        for (CartItem guestItem : guestCart.getItems()) {
            Optional<CartItem> userItem = userCart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(guestItem.getVariant().getId()))
                .findFirst();
            if (userItem.isPresent()) {
                userItem.get().setQuantity(userItem.get().getQuantity() + guestItem.getQuantity());
            } else {
                CartItem newItem = new CartItem();
                newItem.setCart(userCart);
                newItem.setVariant(guestItem.getVariant());
                newItem.setQuantity(guestItem.getQuantity());
                userCart.getItems().add(newItem);
            }
        }
        
        cartRepository.save(userCart);
        cartItemRepository.deleteAll(guestCart.getItems());
        cartRepository.delete(guestCart);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
            .map(item -> {
                com.buyora.api.inventory.entity.InventoryItem inv = inventoryItemRepository.findByVariantId(item.getVariant().getId()).orElse(null);
                int stock = inv != null ? inv.getAvailableQuantity() : 0;
                
                return new CartItemResponse(
                item.getId(),
                new CartItemResponse.ProductInfo(
                    item.getVariant().getProduct().getId(),
                    item.getVariant().getProduct().getName(),
                    item.getVariant().getProduct().getSlug(),
                    item.getVariant().getProduct().getImages().isEmpty() ? null : new CartItemResponse.ImageInfo(
                        item.getVariant().getProduct().getImages().get(0).getUrl(),
                        item.getVariant().getProduct().getImages().get(0).getAltText()
                    )
                ),
                new CartItemResponse.VariantInfo(
                    item.getVariant().getId(),
                    item.getVariant().getSku(),
                    java.util.Collections.emptyMap(),
                    item.getVariant().getPrice(),
                    stock
                ),
                item.getQuantity(),
                item.getVariant().getPrice(),
                item.getVariant().getPrice().multiply(new BigDecimal(item.getQuantity())),
                BigDecimal.ZERO
            );}).collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
            .map(CartItemResponse::totalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = BigDecimal.ZERO;
        if (cart.getCoupon() != null) {
            discount = couponPricing.discount(cart.getCoupon(), subtotal);
        }

        BigDecimal total = subtotal.subtract(discount).max(BigDecimal.ZERO);
        
        CartSummaryResponse summary = new CartSummaryResponse(
            subtotal,
            discount,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            total,
            cart.getCoupon() != null ? cart.getCoupon().getCode() : null,
            cart.getCoupon() != null && "FREE_SHIPPING".equals(cart.getCoupon().getType())
        );
        
        return new CartResponse(
            cart.getPublicId(),
            itemResponses,
            summary,
            itemResponses.stream().mapToInt(CartItemResponse::quantity).sum(),
            cart.getCreatedAt(),
            cart.getUpdatedAt()
        );
    }
}
