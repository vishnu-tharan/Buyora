package com.buyora.api.returns.service;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RefundResolutionController {
  private final JdbcTemplate jdbc;
  private final com.buyora.api.common.security.CurrentUser currentUser;

  public record Resolution(
      @NotBlank @Size(max = 255) String reference,
      @NotNull @DecimalMin("0.01") BigDecimal amount,
      @NotBlank @Size(max = 1000) String evidence) {}

  @PostMapping("/api/v1/admin/returns/{id}/refund-resolution")
  @Transactional
  public void confirm(@PathVariable UUID id, @Valid @RequestBody Resolution input) {
    var rows =
        jdbc.queryForList(
            "SELECT r.id,r.order_id,r.refund_amount,r.refund_state,r.updated_at,o.total FROM"
                + " returns r JOIN orders o ON o.id=r.order_id WHERE r.public_id=? FOR UPDATE OF"
                + " r,o",
            id);
    if (rows.isEmpty()) throw new IllegalArgumentException("Return not found");
    var row = rows.getFirst();
    String state = (String) row.get("refund_state");
    if (!java.util.Set.of("UNKNOWN", "REQUESTED").contains(state)
        && !("PROCESSING".equals(state)
            && ((java.sql.Timestamp) row.get("updated_at"))
                .toInstant()
                .isBefore(java.time.Instant.now().minusSeconds(1800))))
      throw new IllegalArgumentException("Only unresolved or stalled refunds can be reconciled");
    if (input.amount().compareTo((BigDecimal) row.get("refund_amount")) != 0)
      throw new IllegalArgumentException("The verified amount must match this refund");
    jdbc.update(
        "UPDATE returns SET"
            + " status='REFUNDED',refund_state='CONFIRMED',refund_reference=?,updated_at=NOW()"
            + " WHERE id=?",
        input.reference(),
        row.get("id"));
    jdbc.update(
        "INSERT INTO refund_resolution_audit(return_id,actor_id,reference,evidence,amount) VALUES"
            + " (?,?,?,?,?)",
        row.get("id"),
        currentUser.requireId(),
        input.reference(),
        input.evidence(),
        input.amount());
    BigDecimal refunded =
        jdbc.queryForObject(
            "SELECT COALESCE(SUM(refund_amount),0) FROM returns WHERE order_id=? AND"
                + " refund_state='CONFIRMED'",
            BigDecimal.class,
            row.get("order_id"));
    if (refunded.compareTo((BigDecimal) row.get("total")) > 0)
      throw new IllegalArgumentException("Refunds exceed the paid total");
    String status =
        refunded.compareTo((BigDecimal) row.get("total")) == 0 ? "REFUNDED" : "PARTIALLY_REFUNDED";
    jdbc.update(
        "UPDATE orders SET payment_status=?,updated_at=NOW() WHERE id=?",
        status,
        row.get("order_id"));
    jdbc.update(
        "UPDATE payments SET status=?,updated_at=NOW() WHERE order_id=?",
        status,
        row.get("order_id"));
  }
}
