package com.buyora.api.returns.service;

import com.buyora.api.payment.service.PayhereMerchantClient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RefundOperations {
  private final JdbcTemplate jdbc;
  private final PayhereMerchantClient merchant;
  private final PlatformTransactionManager transactions;

  public record Request(@Size(max = 255) String repaymentReference) {}

  @PostMapping("/api/v1/admin/returns/{id}/refund")
  public Map<String, Object> refund(@PathVariable UUID id, @Valid @RequestBody Request request) {
    var row =
        new TransactionTemplate(transactions)
            .execute(
                tx -> {
                  var rows =
                      jdbc.queryForList(
                          "SELECT"
                              + " r.id,r.order_id,r.status,r.refund_state,r.refund_amount,o.payment_method,o.payment_status,o.order_number,o.total,p.provider_payment_id,p.amount,p.currency"
                              + " FROM returns r JOIN orders o ON o.id=r.order_id LEFT JOIN"
                              + " payments p ON p.order_id=o.id WHERE r.public_id=? FOR UPDATE OF"
                              + " r,o",
                          id);
                  if (rows.isEmpty()) throw new IllegalArgumentException("Return not found");
                  var r = rows.getFirst();
                  if (!"RECEIVED".equals(r.get("status"))
                      || !"NOT_REQUESTED".equals(r.get("refund_state")))
                    throw new IllegalArgumentException(
                        "Refund must be for a received return and cannot be submitted twice");
                  if (!Set.of("PAID", "PARTIALLY_REFUNDED").contains(r.get("payment_status")))
                    throw new IllegalArgumentException(
                        "Payment must be confirmed before refunding");
                  Long busy =
                      jdbc.queryForObject(
                          "SELECT COUNT(*) FROM returns WHERE order_id=? AND refund_state IN"
                              + " ('PROCESSING','UNKNOWN','REQUESTED')",
                          Long.class,
                          r.get("order_id"));
                  if (busy != null && busy > 0)
                    throw new IllegalArgumentException(
                        "Resolve the existing refund before submitting another");
                  BigDecimal amount = (BigDecimal) r.get("refund_amount");
                  if (amount.signum() <= 0)
                    throw new IllegalArgumentException("No paid amount to refund");
                  BigDecimal refunded =
                      jdbc.queryForObject(
                          "SELECT COALESCE(SUM(refund_amount),0) FROM returns WHERE order_id=? AND"
                              + " refund_state='CONFIRMED'",
                          BigDecimal.class,
                          r.get("order_id"));
                  if (amount.add(refunded).compareTo((BigDecimal) r.get("total")) > 0)
                    throw new IllegalArgumentException("Refund exceeds the remaining paid amount");
                  if ("CASH_ON_DELIVERY".equals(r.get("payment_method"))) {
                    if (request.repaymentReference() == null
                        || request.repaymentReference().isBlank())
                      throw new IllegalArgumentException(
                          "Enter the completed repayment reference for cash-on-delivery");
                  } else if (!"PAYHERE".equals(r.get("payment_method")) || !merchant.configured())
                    throw new IllegalArgumentException(
                        "PayHere merchant operations are not configured");
                  jdbc.update(
                      "UPDATE returns SET refund_state='PROCESSING',updated_at=NOW() WHERE id=?",
                      r.get("id"));
                  return r;
                });
    String reference = request.repaymentReference();
    try {
      if ("PAYHERE".equals(row.get("payment_method"))) {
        var lookup = merchant.search((String) row.get("order_number"));
        var data = lookup.path("data");
        if (lookup.path("status").asInt() != 1
            || !data.isArray()
            || data.size() != 1
            || !PayhereMerchantClient.matches(
                data.get(0),
                (String) row.get("order_number"),
                (BigDecimal) row.get("amount"),
                (String) row.get("currency"))
            || !Set.of("RECEIVED", "REFUND REQUESTED", "REFUND PROCESSING")
                .contains(data.get(0).path("status").asText()))
          throw new IllegalStateException("Payment details could not be confirmed");
        String paymentId = data.get(0).path("payment_id").asText();
        if (row.get("provider_payment_id") != null
            && !paymentId.equals(row.get("provider_payment_id")))
          throw new IllegalStateException("Provider payment reference does not match");
        var response =
            merchant.refund(paymentId, (BigDecimal) row.get("refund_amount"), "Return " + id);
        if (response.path("status").asInt() != 1
            || response.path("data").isNull()
            || response.path("data").asText().isBlank())
          throw new IllegalStateException("Refund was not confirmed by the provider");
        reference = response.path("data").asText();
      }
      if ("PAYHERE".equals(row.get("payment_method"))) {
        jdbc.update(
            "UPDATE returns SET refund_state=\'REQUESTED\',refund_reference=?,updated_at=NOW()"
                + " WHERE id=?",
            reference,
            row.get("id"));
        return Map.of("state", "REQUESTED", "reference", reference);
      }
      final String confirmedReference = reference;
      new TransactionTemplate(transactions)
          .executeWithoutResult(
              tx -> {
                jdbc.queryForList(
                    "SELECT id FROM orders WHERE id=? FOR UPDATE", row.get("order_id"));
                jdbc.update(
                    "UPDATE returns SET"
                        + " status='REFUNDED',refund_state='CONFIRMED',refund_reference=?,updated_at=NOW()"
                        + " WHERE id=?",
                    confirmedReference,
                    row.get("id"));
                BigDecimal refunded =
                    jdbc.queryForObject(
                        "SELECT COALESCE(SUM(refund_amount),0) FROM returns WHERE order_id=? AND"
                            + " refund_state='CONFIRMED'",
                        BigDecimal.class,
                        row.get("order_id"));
                String status =
                    refunded.compareTo((BigDecimal) row.get("total")) >= 0
                        ? "REFUNDED"
                        : "PARTIALLY_REFUNDED";
                jdbc.update(
                    "UPDATE orders SET payment_status=?,updated_at=NOW() WHERE id=?",
                    status,
                    row.get("order_id"));
                jdbc.update(
                    "UPDATE payments SET status=?,updated_at=NOW() WHERE order_id=?",
                    status,
                    row.get("order_id"));
              });
      return Map.of("state", "CONFIRMED", "reference", reference);
    } catch (RuntimeException e) {
      // A timeout can happen after the provider accepted the refund. Never retry automatically.
      jdbc.update(
          "UPDATE returns SET refund_state='UNKNOWN',updated_at=NOW() WHERE id=?", row.get("id"));
      throw new IllegalStateException(
          "Refund outcome needs reconciliation. Check the provider before trying any further"
              + " refund.");
    }
  }
}
