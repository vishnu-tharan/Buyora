package com.buyora.api.checkout.service;

import com.buyora.api.address.entity.Address;
import com.buyora.api.address.repository.AddressRepository;
import com.buyora.api.cart.entity.Cart;
import com.buyora.api.cart.entity.CartItem;
import com.buyora.api.cart.repository.CartRepository;
import com.buyora.api.cart.service.CartService;
import com.buyora.api.checkout.dto.CheckoutPreviewResponse;
import com.buyora.api.checkout.dto.InitiateCheckoutRequest;
import com.buyora.api.checkout.dto.ShippingMethodResponse;
import com.buyora.api.inventory.service.InventoryService;
import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderItem;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.entity.OrderStatusHistory;
import com.buyora.api.order.entity.PaymentStatus;
import com.buyora.api.order.mapper.OrderMapper;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.order.service.OrderNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    
    private final org.springframework.context.ApplicationEventPublisher events;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final InventoryService inventoryService;
    private final OrderNumberGenerator orderNumberGenerator;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final OrderMapper orderMapper;
    private final com.buyora.api.address.mapper.AddressMapper addressMapper;
    private final com.buyora.api.shipping.repository.ShippingMethodRepository shippingMethods;
    private final com.buyora.api.coupon.repository.CouponRepository coupons;
    private final com.buyora.api.coupon.service.CouponPricing couponPricing;
    private final com.buyora.api.common.config.BuyoraProperties properties;
    private final com.fasterxml.jackson.databind.ObjectMapper json;

    @Override
    @Transactional
    public CheckoutPreviewResponse previewCheckout(String guestId, Long userId) {
        var cartResponse = cartService.getCart(guestId, userId);
        return new CheckoutPreviewResponse(
            cartResponse.summary(),
            paymentMethods(),
            shippingMethods.findByActiveTrueOrderBySortOrderAsc().stream().map(m -> new ShippingMethodResponse(m.getId().toString(), m.getName(), m.getBaseRate(), m.getDescription())).toList()
        );
    }

    @Override
    @Transactional
    public OrderResponse placeOrder(String guestId, Long userId, InitiateCheckoutRequest request) {
        Cart cart = (userId != null ? cartRepository.findByUserId(userId) :
                guestId != null ? cartRepository.findByGuestId(guestId) : java.util.Optional.<Cart>empty())
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        var previous = orderRepository.findByIdempotencyKey(request.idempotencyKey());
        if (previous.isPresent()) {
            var existing = previous.get();
            boolean owner = userId != null ? userId.equals(existing.getUserId()) :
                    guestId != null && guestId.equals(existing.getGuestCartId());
            if (!owner) throw new org.springframework.security.access.AccessDeniedException("Access denied");
            return orderMapper.toResponse(existing);
        }
        if (cart.getItems().isEmpty()) throw new IllegalArgumentException("Cart is empty");
        if (!paymentMethods().contains(request.paymentMethod())) throw new IllegalArgumentException("Payment method unavailable");
        var shippingMethod = shippingMethods.findById(Long.valueOf(request.deliveryMethod()))
                .filter(m -> Boolean.TRUE.equals(m.getActive()))
                .orElseThrow(() -> new IllegalArgumentException("Shipping method unavailable"));

        Map<Long, Integer> variantQuantities = new HashMap<>();
        for (CartItem item : cart.getItems()) {
            if (item.getQuantity() < 1 || !item.getVariant().isActive()
                    || item.getVariant().getProduct().getStatus() != com.buyora.api.product.entity.ProductStatus.ACTIVE) {
                throw new IllegalArgumentException("A cart item is unavailable");
            }
            variantQuantities.merge(item.getVariant().getId(), item.getQuantity(), Math::addExact);
        }

        String orderNumber = orderNumberGenerator.generate();
        inventoryService.reserveStock(variantQuantities, orderNumber);

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUserId(userId);
        order.setGuestCartId(userId == null ? guestId : null);
        order.setIdempotencyKey(request.idempotencyKey());
        order.setGuestEmail(request.guestEmail());
        order.setPaymentMethod(request.paymentMethod());
        order.setDeliveryMethod(request.deliveryMethod());
        order.setCustomerNotes(request.customerNotes());
        
        Object addressSnapshot;
        if (request.shippingAddressId() != null && userId != null) {
            Address address = addressRepository.findByPublicIdAndUserId(request.shippingAddressId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
            order.setShippingAddressId(address.getId());
            addressSnapshot = addressMapper.toResponse(address);
        } else if (request.guestShippingAddress() != null) {
            addressSnapshot = request.guestShippingAddress();
        } else {
            throw new IllegalArgumentException("Shipping address required");
        }
        try {
            order.setShippingSnapshot(json.writeValueAsString(addressSnapshot));
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            throw new IllegalStateException("Cannot save shipping address", error);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem ci : cart.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setProductId(ci.getVariant().getProduct().getId());
            oi.setVariantId(ci.getVariant().getId());
            oi.setSku(ci.getVariant().getSku());
            oi.setProductName(ci.getVariant().getProduct().getName());
            oi.setPrice(ci.getVariant().getPrice());
            oi.setQuantity(ci.getQuantity());
            BigDecimal total = ci.getVariant().getPrice().multiply(new BigDecimal(ci.getQuantity()));
            oi.setTotal(total);
            order.addItem(oi);
            subtotal = subtotal.add(total);
        }

        order.setSubtotal(subtotal);
        var coupon = cart.getCoupon() == null ? null : coupons.findByCode(cart.getCoupon().getCode()).orElseThrow();
        BigDecimal discount = couponPricing.discount(coupon, subtotal);
        BigDecimal shipping = coupon != null && "FREE_SHIPPING".equals(coupon.getType()) ? BigDecimal.ZERO : shippingMethod.getBaseRate();
        if (shipping.signum() < 0) throw new IllegalArgumentException("Invalid shipping rate");
        order.setDiscountAmount(discount);
        order.setCouponCode(coupon == null ? null : coupon.getCode());
        order.setShippingAmount(shipping);
        order.setTotal(subtotal.subtract(discount).add(shipping).setScale(2, java.math.RoundingMode.HALF_UP));
        if (coupon != null) { coupon.setUsedCount(coupon.getUsedCount() + 1); coupons.save(coupon); }
        if ("CASH_ON_DELIVERY".equals(request.paymentMethod())) order.setStatus(OrderStatus.PROCESSING);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setStatus(order.getStatus());
        history.setNotes("Order placed");
        order.addHistory(history);

        Order saved = orderRepository.saveAndFlush(order);
        if ("CASH_ON_DELIVERY".equals(request.paymentMethod())) inventoryService.confirmStock(orderNumber);
        
        // Clear cart
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.save(cart);

        events.publishEvent(new com.buyora.api.common.event.OrderPlacedEvent(saved.getPublicId(), saved.getOrderNumber(), saved.getGuestEmail()));
        return orderMapper.toResponse(saved);
    }
    private List<String> paymentMethods() {
        var methods = new java.util.ArrayList<String>();
        if (properties.getPayment().getCod().isEnabled()) methods.add("CASH_ON_DELIVERY");
        String secret = properties.getPayment().getPayhere().getMerchantSecret();
        String merchant = properties.getPayment().getPayhere().getMerchantId();
        if (secret != null && !secret.isBlank() && merchant != null && !merchant.isBlank()) methods.add("PAYHERE");
        return methods;
    }
}
