package com.buyora.api.alerts;

import com.buyora.api.common.security.CurrentUser;
import com.buyora.api.notification.service.EmailOutbox;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ProductAlertService {
  private final JdbcTemplate jdbc;
  private final CurrentUser user;
  private final EmailOutbox outbox;
  private final com.buyora.api.common.config.BuyoraProperties properties;

  public record Subscribe(
      @NotNull @Positive Long variantId,
      @NotBlank @Pattern(regexp = "BACK_IN_STOCK|PRICE_DROP") String kind) {}

  @PostMapping("/api/v1/alerts")
  @Transactional
  public void subscribe(@Valid @RequestBody Subscribe input) {
    Long userId = user.requireId();
    var variants =
        jdbc.queryForList(
            "SELECT v.price,(i.stock_quantity-i.reserved_quantity) AS available FROM"
                + " product_variants v JOIN products p ON p.id=v.product_id JOIN inventory_items i"
                + " ON i.variant_id=v.id WHERE v.id=? AND v.active AND p.status='ACTIVE'",
            input.variantId());
    if (variants.isEmpty()) throw new IllegalArgumentException("Variant unavailable");
    if (input.kind().equals("BACK_IN_STOCK")
        && ((Number) variants.getFirst().get("available")).intValue() > 0)
      throw new IllegalArgumentException("This variant is already in stock");
    Integer count =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM product_alerts WHERE user_id=? AND active",
            Integer.class,
            userId);
    if (count != null && count >= 50)
      throw new IllegalArgumentException("You can have up to 50 active product alerts");
    jdbc.update(
        "INSERT INTO product_alerts(user_id,variant_id,kind,baseline_price) VALUES (?,?,?,?) ON"
            + " CONFLICT(user_id,variant_id,kind) WHERE active DO NOTHING",
        userId,
        input.variantId(),
        input.kind(),
        variants.getFirst().get("price"));
  }

  @GetMapping("/api/v1/alerts")
  public List<Map<String, Object>> list() {
    return jdbc.queryForList(
        "SELECT"
            + " a.id,a.kind,a.active,a.created_at,a.notified_at,p.name,p.slug,v.sku,a.baseline_price"
            + " FROM product_alerts a JOIN product_variants v ON v.id=a.variant_id JOIN products p"
            + " ON p.id=v.product_id WHERE a.user_id=? ORDER BY a.created_at DESC LIMIT 100",
        user.requireId());
  }

  @DeleteMapping("/api/v1/alerts/{id}")
  public void cancel(@PathVariable UUID id) {
    jdbc.update(
        "UPDATE product_alerts SET active=FALSE WHERE id=? AND user_id=?", id, user.requireId());
  }

  @Scheduled(fixedDelayString = "${buyora.alerts.poll-delay-ms:60000}")
  @Transactional
  public void notifyCustomers() {
    var rows =
        jdbc.queryForList(
            "SELECT a.id,a.kind,u.email,p.name,p.slug,v.price FROM product_alerts a JOIN users u ON"
                + " u.id=a.user_id JOIN product_variants v ON v.id=a.variant_id JOIN products p ON"
                + " p.id=v.product_id JOIN inventory_items i ON i.variant_id=v.id WHERE a.active"
                + " AND u.email_verified AND u.status='ACTIVE' AND p.status='ACTIVE' AND v.active"
                + " AND ((a.kind='BACK_IN_STOCK' AND i.stock_quantity>i.reserved_quantity) OR"
                + " (a.kind='PRICE_DROP' AND v.price<a.baseline_price)) ORDER BY a.created_at LIMIT"
                + " 20 FOR UPDATE OF a SKIP LOCKED");
    for (var row : rows) {
      String subject =
          row.get("kind").equals("BACK_IN_STOCK")
              ? "Back in stock at Buyora"
              : "A lower price at Buyora";
      outbox.enqueue(
          (String) row.get("email"),
          subject,
          row.get("name")
              + " is "
              + (row.get("kind").equals("BACK_IN_STOCK")
                  ? "back in stock"
                  : "now LKR " + row.get("price"))
              + ".\n\n"
              + properties.getFrontendUrl()
              + "/product/"
              + row.get("slug")
              + "\n\nAvailability and price can change. Manage your alerts: "
              + properties.getFrontendUrl()
              + "/account/alerts");
      jdbc.update(
          "UPDATE product_alerts SET active=FALSE,notified_at=NOW() WHERE id=?", row.get("id"));
    }
  }
}
