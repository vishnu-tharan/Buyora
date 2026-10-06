package com.buyora.api.payment;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.inventory.service.InventoryService;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.payment.entity.*;
import com.buyora.api.payment.repository.PaymentRepository;
import com.buyora.api.payment.webhook.PayhereWebhookHandler;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import org.junit.jupiter.api.Test;

class PayhereWebhookTest {
  final BuyoraProperties properties = new BuyoraProperties();
  final PaymentRepository payments = mock(PaymentRepository.class);
  final OrderRepository orders = mock(OrderRepository.class);
  final InventoryService inventory = mock(InventoryService.class);
  final com.buyora.api.payment.service.PaymentReconciliation reconciliation =
      mock(com.buyora.api.payment.service.PaymentReconciliation.class);
  final PayhereWebhookHandler handler =
      new PayhereWebhookHandler(
          properties,
          payments,
          orders,
          inventory,
          mock(org.springframework.jdbc.core.JdbcTemplate.class),
          reconciliation);

  PayhereWebhookTest() {
    properties.getPayment().getPayhere().setMerchantId("merchant");
    properties.getPayment().getPayhere().setMerchantSecret("test-secret");
  }

  String md5(String value) throws Exception {
    return HexFormat.of()
        .formatHex(MessageDigest.getInstance("MD5").digest(value.getBytes(StandardCharsets.UTF_8)))
        .toUpperCase(Locale.ROOT);
  }

  Map<String, String> form(String amount) throws Exception {
    return Map.of(
        "merchant_id",
        "merchant",
        "order_id",
        "ORD-1",
        "payhere_amount",
        amount,
        "payhere_currency",
        "LKR",
        "status_code",
        "2",
        "md5sig",
        md5("merchantORD-1" + amount + "LKR2" + md5("test-secret")));
  }

  Payment setup() {
    Order order = new Order();
    order.setOrderNumber("ORD-1");
    Payment payment =
        Payment.builder()
            .order(order)
            .currency("LKR")
            .paymentMethod("PAYHERE")
            .amount(new BigDecimal("100.00"))
            .status(PaymentStatus.PENDING)
            .build();
    when(orders.findForUpdate("ORD-1")).thenReturn(Optional.of(order));
    when(payments.findByOrder_OrderNumber("ORD-1")).thenReturn(Optional.of(payment));
    return payment;
  }

  @Test
  void rejectsInvalidSignatureBeforeLookingUpAnOrder() {
    assertThatThrownBy(() -> handler.handle(Map.of("md5sig", "invalid")))
        .isInstanceOf(IllegalArgumentException.class);
    verifyNoInteractions(orders, payments, inventory);
  }

  @Test
  void rejectsSignedButIncorrectAmount() throws Exception {
    Payment payment = setup();
    assertThatThrownBy(() -> handler.handle(form("99.00")))
        .isInstanceOf(IllegalArgumentException.class);
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
    verifyNoInteractions(inventory);
  }

  @Test
  void successfulNotificationSettlesStockOnlyOnce() throws Exception {
    Payment payment = setup();
    handler.handle(form("100.00"));
    handler.handle(form("100.00"));
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
    verify(inventory, times(1)).confirmStock("ORD-1");
  }

  @Test
  void latePaymentAfterCancellationNeedsReviewWithoutTouchingStock() throws Exception {
    Payment payment = setup();
    payment.getOrder().setStatus(com.buyora.api.order.entity.OrderStatus.CANCELLED);
    handler.handle(form("100.00"));
    assertThat(payment.getOrder().getStatus())
        .isEqualTo(com.buyora.api.order.entity.OrderStatus.CANCELLED);
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
    verifyNoInteractions(inventory);
    verify(reconciliation).note(eq("ORD-1"), eq("NEEDS_REVIEW"), anyString());
  }

  @Test
  void duplicatePaymentDoesNotUndoPartialRefund() throws Exception {
    Payment payment = setup();
    payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
    handler.handle(form("100.00"));
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PARTIALLY_REFUNDED);
    verifyNoInteractions(inventory);
  }

  @Test
  void rejectsSignedCurrencyMismatch() throws Exception {
    Payment payment = setup();
    payment.setCurrency("USD");
    assertThatThrownBy(() -> handler.handle(form("100.00")))
        .isInstanceOf(IllegalArgumentException.class);
    verifyNoInteractions(inventory);
  }
}
