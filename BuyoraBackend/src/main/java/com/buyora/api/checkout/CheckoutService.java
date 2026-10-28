package com.buyora.api.checkout;

import com.buyora.api.address.Address;
import com.buyora.api.address.AddressRepository;
import com.buyora.api.cart.Cart;
import com.buyora.api.cart.CartItem;
import com.buyora.api.cart.CartRepository;
import com.buyora.api.cart.CartService;
import com.buyora.api.inventory.InventoryService;
import com.buyora.api.order.Order;
import com.buyora.api.order.OrderItem;
import com.buyora.api.order.OrderMapper;
import com.buyora.api.order.OrderNumberGenerator;
import com.buyora.api.order.OrderRepository;
import com.buyora.api.order.OrderResponse;
import com.buyora.api.order.OrderStatus;
import com.buyora.api.order.OrderStatusHistory;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CheckoutService {

  private final CartService cartService;
  private final CartRepository cartRepository;
  private final InventoryService inventoryService;
  private final OrderNumberGenerator orderNumberGenerator;
  private final OrderRepository orderRepository;
  private final AddressRepository addressRepository;
  private final OrderMapper orderMapper;
  private final com.buyora.api.address.AddressMapper addressMapper;
  private final com.buyora.api.shipping.ShippingMethodRepository shippingMethods;
  private final com.buyora.api.coupon.CouponRepository coupons;
  private final com.buyora.api.coupon.CouponPricing couponPricing;
  private final com.buyora.api.common.config.BuyoraProperties properties;
  private final com.fasterxml.jackson.databind.ObjectMapper json;
  private final com.buyora.api.store.StoreSettings settings;

  @Transactional
  public CheckoutPreviewResponse previewCheckout(String guestId, Long userId) {
    var cartResponse = cartService.getCart(guestId, userId);
    return new CheckoutPreviewResponse(
        cartResponse.summary(),
        paymentMethods(),
        shippingMethods.findByActiveTrueOrderBySortOrderAsc().stream()
            .map(
                m ->
                    new ShippingMethodResponse(
                        m.getId().toString(), m.getName(), m.getBaseRate(), m.getDescription()))
            .toList());
  }

  @Transactional
  public OrderResponse placeOrder(String guestId, Long userId, InitiateCheckoutRequest request) {
    Cart cart = findCart(guestId, userId);
    // A repeated submission returns the original order only to its owner.
    var previousOrder = orderRepository.findByIdempotencyKey(request.idempotencyKey());
    if (previousOrder.isPresent()) {
      Order existingOrder = previousOrder.get();
      boolean isOrderOwner;
      if (userId != null) {
        isOrderOwner = userId.equals(existingOrder.getUserId());
      } else {
        isOrderOwner = guestId != null && guestId.equals(existingOrder.getGuestCartId());
      }
      if (!isOrderOwner) {
        throw new org.springframework.security.access.AccessDeniedException("Access denied");
      }
      return orderMapper.toResponse(existingOrder);
    }
    if (cart.getItems().isEmpty()) throw new IllegalArgumentException("Cart is empty");
    if (!paymentMethods().contains(request.paymentMethod()))
      throw new IllegalArgumentException("Payment method unavailable");
    var shippingMethod =
        shippingMethods
            .findById(Long.valueOf(request.deliveryMethod()))
            .filter(m -> Boolean.TRUE.equals(m.getActive()))
            .orElseThrow(() -> new IllegalArgumentException("Shipping method unavailable"));

    Map<Long, Integer> variantQuantities = quantitiesFor(cart);

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
      Address address =
          addressRepository
              .findByPublicIdAndUserId(request.shippingAddressId(), userId)
              .orElseThrow(() -> new IllegalArgumentException("Address not found"));
      order.setShippingAddressId(address.getId());
      addressSnapshot = addressMapper.toResponse(address);
    } else if (request.guestShippingAddress() != null) {
      addressSnapshot = request.guestShippingAddress();
    } else {
      throw new IllegalArgumentException("Shipping address required");
    }
    try {
      var tree = json.valueToTree(addressSnapshot);
      String district = tree.path("district").asText();
      if (!com.buyora.api.store.Districts.ALL.contains(district))
        throw new IllegalArgumentException("Select a valid district");
      var store = settings.get();
      if ("CASH_ON_DELIVERY".equals(request.paymentMethod())
          && !store.codDistricts().isEmpty()
          && !store.codDistricts().contains(district))
        throw new IllegalArgumentException("Cash on delivery is unavailable in this district");
      int days =
          Math.max(store.deliveryMinDays(), store.deliveryMaxDays())
              + Math.max(0, store.districtExtraDays().getOrDefault(district, 0));
      java.time.LocalDate estimate = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Colombo"));
      for (int n = 0; n < days; ) {
        estimate = estimate.plusDays(1);
        if (estimate.getDayOfWeek() != java.time.DayOfWeek.SATURDAY
            && estimate.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) n++;
      }
      order.setEstimatedDelivery(
          estimate.atStartOfDay(java.time.ZoneId.of("Asia/Colombo")).toInstant());
      order.setShippingSnapshot(json.writeValueAsString(addressSnapshot));
    } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
      throw new IllegalStateException("Cannot save shipping address", error);
    }

    BigDecimal subtotal = copyItemsToOrder(cart, order);

    order.setSubtotal(subtotal);
    var coupon =
        cart.getCoupon() == null
            ? null
            : coupons.findByCode(cart.getCoupon().getCode()).orElseThrow();
    BigDecimal discount = couponPricing.discount(coupon, subtotal);
    BigDecimal shipping =
        coupon != null && "FREE_SHIPPING".equals(coupon.getType())
            ? BigDecimal.ZERO
            : shippingMethod.getBaseRate();
    if (shipping.signum() < 0) throw new IllegalArgumentException("Invalid shipping rate");
    order.setDiscountAmount(discount);
    order.setCouponCode(coupon == null ? null : coupon.getCode());
    order.setShippingAmount(shipping);
    order.setTotal(
        subtotal.subtract(discount).add(shipping).setScale(2, java.math.RoundingMode.HALF_UP));
    if (coupon != null) {
      coupon.setUsedCount(coupon.getUsedCount() + 1);
      coupons.save(coupon);
    }
    if ("CASH_ON_DELIVERY".equals(request.paymentMethod())) order.setStatus(OrderStatus.PROCESSING);

    OrderStatusHistory history = new OrderStatusHistory();
    history.setStatus(order.getStatus());
    history.setNotes("Order placed");
    order.addHistory(history);

    Order saved = orderRepository.saveAndFlush(order);
    if ("CASH_ON_DELIVERY".equals(request.paymentMethod()))
      inventoryService.confirmStock(orderNumber);

    // Clear cart
    cart.getItems().clear();
    cart.setCoupon(null);
    cartRepository.save(cart);

    return orderMapper.toResponse(saved);
  }

  private Cart findCart(String guestId, Long userId) {
    if (userId != null) {
      return cartRepository
          .findByUserId(userId)
          .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
    }
    if (guestId == null) throw new IllegalArgumentException("Cart not found");
    return cartRepository
        .findByGuestId(guestId)
        .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
  }

  private Map<Long, Integer> quantitiesFor(Cart cart) {
    Map<Long, Integer> variantQuantities = new HashMap<>();
    for (CartItem item : cart.getItems()) {
      if (item.getQuantity() < 1
          || !item.getVariant().isActive()
          || item.getVariant().getProduct().getStatus()
              != com.buyora.api.product.ProductStatus.ACTIVE) {
        throw new IllegalArgumentException("A cart item is unavailable");
      }
      variantQuantities.merge(item.getVariant().getId(), item.getQuantity(), Math::addExact);
    }

    return variantQuantities;
  }

  private BigDecimal copyItemsToOrder(Cart cart, Order order) {
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

    return subtotal;
  }

  private List<String> paymentMethods() {
    var methods = new java.util.ArrayList<String>();
    if (properties.getPayment().getCod().isEnabled()) methods.add("CASH_ON_DELIVERY");
    String secret = properties.getPayment().getPayhere().getMerchantSecret();
    String merchant = properties.getPayment().getPayhere().getMerchantId();
    if (secret != null && !secret.isBlank() && merchant != null && !merchant.isBlank())
      methods.add("PAYHERE");
    return methods;
  }
}
