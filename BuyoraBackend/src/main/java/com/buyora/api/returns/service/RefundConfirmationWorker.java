package com.buyora.api.returns.service;

import com.buyora.api.payment.service.PayhereMerchantClient;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class RefundConfirmationWorker {
  private final JdbcTemplate jdbc;
  private final PayhereMerchantClient merchant;
  private final PlatformTransactionManager transactions;

  @Scheduled(fixedDelayString = "${buyora.payment.refund-check-delay-ms:60000}")
  public void check() {
    if (!merchant.configured()) return;
    var rows =
        jdbc.queryForList(
            "SELECT"
                + " r.id,r.order_id,r.refund_amount,o.order_number,o.total,p.amount,p.currency,p.provider_payment_id"
                + " FROM returns r JOIN orders o ON o.id=r.order_id JOIN payments p ON"
                + " p.order_id=o.id WHERE r.refund_state='REQUESTED' AND o.payment_method='PAYHERE'"
                + " ORDER BY r.updated_at LIMIT 5");
    for (var row : rows)
      try {
        var response = merchant.search((String) row.get("order_number"));
        if (response.path("status").asInt() != 1
            || !response.path("data").isArray()
            || response.path("data").size() != 1) continue;
        var record = response.path("data").get(0);
        if (!PayhereMerchantClient.matches(
                record,
                (String) row.get("order_number"),
                (BigDecimal) row.get("amount"),
                (String) row.get("currency"))
            || !"REFUNDED".equals(record.path("status").asText())) continue;
        if (row.get("provider_payment_id") != null
            && !row.get("provider_payment_id").equals(record.path("payment_id").asText())) continue;
        // Retrieval confirms an entire payment refund. Partial refunds require an operator
        // to verify the exact refund reference/amount in the provider dashboard.
        if (((BigDecimal) row.get("refund_amount")).compareTo((BigDecimal) row.get("total")) != 0)
          continue;
        new TransactionTemplate(transactions)
            .executeWithoutResult(
                tx -> {
                  jdbc.queryForList(
                      "SELECT id FROM orders WHERE id=? FOR UPDATE", row.get("order_id"));
                  int changed =
                      jdbc.update(
                          "UPDATE returns SET"
                              + " status='REFUNDED',refund_state='CONFIRMED',updated_at=NOW() WHERE"
                              + " id=? AND refund_state='REQUESTED'",
                          row.get("id"));
                  if (changed == 1) {
                    jdbc.update(
                        "UPDATE orders SET payment_status='REFUNDED',updated_at=NOW() WHERE id=?",
                        row.get("order_id"));
                    jdbc.update(
                        "UPDATE payments SET status='REFUNDED',updated_at=NOW() WHERE order_id=?",
                        row.get("order_id"));
                  }
                });
      } catch (RuntimeException ignored) {
        /* Keep pending; a later check or operator can reconcile. */
      }
  }
}
