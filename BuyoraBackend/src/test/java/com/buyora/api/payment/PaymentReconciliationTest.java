package com.buyora.api.payment;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.inventory.service.InventoryService;
import com.buyora.api.order.entity.*;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.payment.entity.Payment;
import com.buyora.api.payment.repository.PaymentRepository;
import com.buyora.api.payment.service.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

class PaymentReconciliationTest {
  final JdbcTemplate jdbc = mock(JdbcTemplate.class);
  final OrderRepository orders = mock(OrderRepository.class);
  final PaymentRepository payments = mock(PaymentRepository.class);
  final InventoryService stock = mock(InventoryService.class);
  final PayhereMerchantClient merchant = mock(PayhereMerchantClient.class);
  final BuyoraProperties config = new BuyoraProperties();
  final PlatformTransactionManager tx = mock(PlatformTransactionManager.class);
  final PaymentReconciliation service =
      new PaymentReconciliation(jdbc, orders, payments, stock, merchant, config, tx);

  Order setup() {
    when(tx.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
    var o = new Order();
    o.setId(1L);
    o.setOrderNumber("ORD-1");
    o.setCreatedAt(Instant.now().minusSeconds(3600));
    when(orders.findForUpdate("ORD-1")).thenReturn(Optional.of(o));
    return o;
  }

  @Test
  void onlyUninitiatedExpiredOrdersReleaseStock() {
    var o = setup();
    when(payments.findByOrder_OrderNumber("ORD-1")).thenReturn(Optional.empty());
    service.reconcile("ORD-1");
    verify(stock).releaseStock("ORD-1");
    verifyNoInteractions(merchant);
    assertThat(o.getStatus()).isEqualTo(OrderStatus.CANCELLED);
  }

  @Test
  void initiatedPaymentWithoutProviderAccessKeepsStockReserved() {
    setup();
    when(payments.findByOrder_OrderNumber("ORD-1"))
        .thenReturn(Optional.of(Payment.builder().amount(new BigDecimal("100")).build()));
    service.reconcile("ORD-1");
    verifyNoInteractions(stock);
    verify(jdbc)
        .update(contains("payment_reconciliation"), eq("NEEDS_REVIEW"), anyString(), eq("ORD-1"));
  }

  @Test
  void freshUninitiatedOrdersDoNotExpire() {
    var o = setup();
    o.setCreatedAt(Instant.now());
    when(payments.findByOrder_OrderNumber("ORD-1")).thenReturn(Optional.empty());
    service.reconcile("ORD-1");
    verifyNoInteractions(stock);
    assertThat(o.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
  }
}
