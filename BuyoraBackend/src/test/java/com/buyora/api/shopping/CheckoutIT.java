package com.buyora.api.shopping;

import static org.assertj.core.api.Assertions.*;

import com.buyora.api.address.AddressRequest;
import com.buyora.api.cart.CartService;
import com.buyora.api.checkout.CheckoutService;
import com.buyora.api.checkout.InitiateCheckoutRequest;
import com.buyora.api.common.AbstractIntegrationTest;
import com.buyora.api.order.OrderService;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;

class CheckoutIT extends AbstractIntegrationTest {
  @Autowired JdbcTemplate jdbc;
  @Autowired CartService carts;
  @Autowired CheckoutService checkout;
  @Autowired OrderService orders;
  @Autowired com.buyora.api.address.AddressService addresses;
  private Long variantId;
  private String guest;
  private String shippingId;

  @BeforeEach
  void prepareProductAndCart() {
    String suffix = UUID.randomUUID().toString();
    Long category =
        jdbc.queryForObject(
            "INSERT INTO categories(name,slug) VALUES ('Test category',?) RETURNING id",
            Long.class,
            suffix);
    Long product =
        jdbc.queryForObject(
            "INSERT INTO products(name,slug,category_id,status) VALUES ('Test"
                + " notebook',?,?,'ACTIVE') RETURNING id",
            Long.class,
            suffix,
            category);
    variantId =
        jdbc.queryForObject(
            "INSERT INTO product_variants(product_id,sku,price) VALUES (?,?,200) RETURNING id",
            Long.class,
            product,
            suffix);
    jdbc.update("INSERT INTO inventory_items(variant_id,stock_quantity) VALUES (?,5)", variantId);
    guest = UUID.randomUUID().toString();
    shippingId =
        jdbc.queryForObject(
            "SELECT id::text FROM shipping_methods WHERE name='Standard Delivery'", String.class);
    carts.addToCart(guest, null, variantId, 2);
  }

  private InitiateCheckoutRequest request(String district) {
    AddressRequest address =
        new AddressRequest(
            null,
            "Test",
            "Customer",
            "0771234567",
            "1 Test Road",
            null,
            "Colombo",
            district,
            null,
            null,
            "Sri Lanka",
            "LK",
            false,
            false);
    return new InitiateCheckoutRequest(
        null,
        address,
        "CASH_ON_DELIVERY",
        shippingId,
        null,
        "customer@example.test",
        UUID.randomUUID().toString());
  }

  @Test
  void checkoutCalculatesTotalsAndDoesNotDuplicateAnOrder() {
    var request = request("Colombo");
    var order = checkout.placeOrder(guest, null, request);
    assertThat(order.subtotal()).isEqualByComparingTo(new BigDecimal("400.00"));
    assertThat(order.shippingAmount()).isEqualByComparingTo(new BigDecimal("350.00"));
    assertThat(order.total()).isEqualByComparingTo(new BigDecimal("750.00"));
    assertThat(order.status()).isEqualTo("PROCESSING");
    assertThat(checkout.placeOrder(guest, null, request).orderNumber())
        .isEqualTo(order.orderNumber());
    assertThat(
            jdbc.queryForObject(
                "SELECT stock_quantity FROM inventory_items WHERE variant_id=?",
                Integer.class,
                variantId))
        .isEqualTo(3);
    assertThat(carts.getCart(guest, null).items()).isEmpty();
  }

  @Test
  void guestOrdersCannotBeReadByAnotherGuest() {
    var order = checkout.placeOrder(guest, null, request("Colombo"));
    assertThat(orders.getOrder(order.orderNumber(), null, guest).orderNumber())
        .isEqualTo(order.orderNumber());
    assertThatThrownBy(
            () -> orders.getOrder(order.orderNumber(), null, UUID.randomUUID().toString()))
        .isInstanceOf(AccessDeniedException.class);
  }

  @Test
  void invalidCheckoutRollsBackStockAndPreservesTheCart() {
    assertThatThrownBy(() -> checkout.placeOrder(guest, null, request("Invalid district")))
        .isInstanceOf(IllegalArgumentException.class);
    assertThat(
            jdbc.queryForObject(
                "SELECT stock_quantity FROM inventory_items WHERE variant_id=?",
                Integer.class,
                variantId))
        .isEqualTo(5);
    assertThat(
            jdbc.queryForObject(
                "SELECT reserved_quantity FROM inventory_items WHERE variant_id=?",
                Integer.class,
                variantId))
        .isZero();
    assertThat(carts.getCart(guest, null).items()).hasSize(1);
  }

  @Test
  void expiredCouponDoesNotPreventCartLoading() {
    String code = "EXPIRED-" + UUID.randomUUID();
    Long coupon =
        jdbc.queryForObject(
            "INSERT INTO coupons(code,type,value,active,valid_to)"
                + " VALUES (?,'FIXED',50,true,now()+interval '1 day') RETURNING id",
            Long.class,
            code);
    carts.applyCoupon(guest, null, code);
    jdbc.update("UPDATE coupons SET valid_to=now()-interval '1 day' WHERE id=?", coupon);
    var cart = carts.getCart(guest, null);
    assertThat(cart.items()).hasSize(1);
    assertThat(cart.summary().discountAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(cart.summary().couponCode()).isNull();
  }

  @Test
  void invalidStatusTransitionDoesNotChangeTheOrder() {
    var order = checkout.placeOrder(guest, null, request("Colombo"));
    assertThatThrownBy(
            () -> orders.updateOrderStatus(
                order.orderNumber(), com.buyora.api.order.OrderStatus.DELIVERED, "Skip shipping"))
        .isInstanceOf(IllegalArgumentException.class);
    assertThat(orders.getOrder(order.orderNumber(), null, guest).status()).isEqualTo("PROCESSING");
  }

  @Test
  void selectingTheCurrentDefaultAddressKeepsItDefault() {
    Long user =
        jdbc.queryForObject(
            "INSERT INTO users(email,password_hash,first_name,last_name,status)"
                + " VALUES (?,'test','Test','Customer','ACTIVE') RETURNING id",
            Long.class,
            UUID.randomUUID() + "@example.test");
    AddressRequest address =
        new AddressRequest(
            "Home", "Test", "Customer", "0771234567", "1 Test Road", null,
            "Colombo", "Colombo", null, null, "Sri Lanka", "LK", true, true);
    var saved = addresses.createAddress(user, address);
    var id = UUID.fromString(saved.publicId());
    addresses.setDefaultShipping(user, id);
    addresses.setDefaultBilling(user, id);
    var reloaded = addresses.getAddresses(user).getFirst();
    assertThat(reloaded.isDefaultShipping()).isTrue();
    assertThat(reloaded.isDefaultBilling()).isTrue();
    assertThatThrownBy(() -> addresses.setDefaultShipping(user + 100000, id))
        .isInstanceOf(com.buyora.api.common.exception.ResourceNotFoundException.class);
  }
}
