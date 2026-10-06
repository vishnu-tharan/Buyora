package com.buyora.api.payment.service;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.inventory.service.InventoryService;
import com.buyora.api.order.entity.*;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class PaymentReconciliation {
  private final JdbcTemplate jdbc;
  private final OrderRepository orders;
  private final PaymentRepository payments;
  private final InventoryService inventory;
  private final PayhereMerchantClient merchant;
  private final BuyoraProperties properties;
  private final PlatformTransactionManager transactions;

  @Scheduled(fixedDelayString = "${buyora.payment.reconcile-delay-ms:60000}")
  public void scan() {
    var rows =
        jdbc.queryForList(
            "SELECT order_number FROM orders WHERE status='PENDING_PAYMENT' AND"
                + " payment_method='PAYHERE' AND created_at<NOW()-(? * INTERVAL '1 minute') ORDER"
                + " BY created_at LIMIT 5",
            properties.getInventory().getReservationExpiryMinutes());
    for (var row : rows)
      try {
        reconcile((String) row.get("order_number"));
      } catch (RuntimeException e) {
        note(
            (String) row.get("order_number"),
            "NEEDS_REVIEW",
            "Provider status could not be confirmed; stock remains reserved");
      }
  }

  public void reconcile(String number) {
    var initiated =
        new TransactionTemplate(transactions)
            .execute(
                tx -> {
                  var order =
                      orders
                          .findForUpdate(number)
                          .orElseThrow(() -> new IllegalArgumentException("Order not found"));
                  if (order.getStatus() != OrderStatus.PENDING_PAYMENT) return null;
                  var payment = payments.findByOrder_OrderNumber(number);
                  if (payment.isEmpty()) {
                    if (order
                        .getCreatedAt()
                        .plusSeconds(properties.getInventory().getReservationExpiryMinutes() * 60L)
                        .isAfter(java.time.Instant.now())) return null;
                    inventory.releaseStock(number);
                    order.setStatus(OrderStatus.CANCELLED);
                    var history = new OrderStatusHistory();
                    history.setStatus(OrderStatus.CANCELLED);
                    history.setNotes("Expired before payment was initiated");
                    order.addHistory(history);
                    orders.save(order);
                    return null;
                  }
                  return payment.get().getAmount();
                });
    if (initiated == null) return;
    if (!merchant.configured()) {
      note(number, "NEEDS_REVIEW", "Configure PayHere merchant retrieval; stock remains reserved");
      return;
    }
    var response = merchant.search(number);
    if (response.path("status").asInt() != 1
        || !response.path("data").isArray()
        || response.path("data").size() != 1) {
      note(
          number,
          "NEEDS_REVIEW",
          "Provider has not confirmed a unique settlement; stock remains reserved");
      return;
    }
    var record = response.path("data").get(0);
    new TransactionTemplate(transactions)
        .executeWithoutResult(
            tx -> {
              var order = orders.findForUpdate(number).orElseThrow();
              var payment = payments.findByOrder_OrderNumber(number).orElseThrow();
              if (!PayhereMerchantClient.matches(
                  record, number, payment.getAmount(), payment.getCurrency())) {
                note(number, "NEEDS_REVIEW", "Settlement details do not match");
                return;
              }
              if (record.path("status").asText().equals("RECEIVED")
                  && order.getStatus() == OrderStatus.PENDING_PAYMENT
                  && payment.getStatus() == com.buyora.api.payment.entity.PaymentStatus.PENDING) {
                inventory.confirmStock(number);
                payment.setStatus(com.buyora.api.payment.entity.PaymentStatus.SUCCESS);
                payment.setProviderPaymentId(record.path("payment_id").asText());
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setStatus(OrderStatus.PROCESSING);
                var history = new OrderStatusHistory();
                history.setStatus(OrderStatus.PROCESSING);
                history.setNotes("Payment confirmed through provider reconciliation");
                order.addHistory(history);
                orders.save(order);
                payments.save(payment);
                note(number, "RESOLVED", "Payment confirmed");
              } else
                note(
                    number,
                    "NEEDS_REVIEW",
                    "Provider status: " + record.path("status").asText() + "; review required");
            });
  }

  public void note(String number, String state, String note) {
    jdbc.update(
        "INSERT INTO payment_reconciliation(order_id,state,checked_at,note) SELECT id,?,NOW(),?"
            + " FROM orders WHERE order_number=? ON CONFLICT(order_id) DO UPDATE SET"
            + " state=EXCLUDED.state,checked_at=NOW(),note=EXCLUDED.note,updated_at=NOW()",
        state,
        note,
        number);
  }
}
