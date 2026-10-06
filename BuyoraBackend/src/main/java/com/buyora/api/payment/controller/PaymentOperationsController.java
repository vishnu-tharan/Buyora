package com.buyora.api.payment.controller;

import com.buyora.api.payment.service.PaymentReconciliation;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentOperationsController {
  private final JdbcTemplate jdbc;
  private final PaymentReconciliation reconciliation;

  @GetMapping("/api/v1/admin/payment-reconciliation")
  public List<Map<String, Object>> list() {
    return jdbc.queryForList(
        "SELECT o.order_number,o.total,o.payment_status,r.state,r.note,r.checked_at FROM"
            + " payment_reconciliation r JOIN orders o ON o.id=r.order_id ORDER BY r.updated_at"
            + " DESC LIMIT 100");
  }

  @PostMapping("/api/v1/admin/payment-reconciliation/{number}/check")
  public void check(@PathVariable String number) {
    reconciliation.reconcile(number);
  }
}
