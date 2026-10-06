package com.buyora.api.analytics;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AnalyticsController {
  private final JdbcTemplate jdbc;

  public record Event(
      @Pattern(
              regexp =
                  "product_view|search|add_to_cart|remove_from_cart|begin_checkout|purchase|order_placed|add_to_wishlist|coupon_applied")
          String type) {}

  @PostMapping("/api/v1/analytics/events")
  public void event(@Valid @RequestBody Event event) {
    if (event.type() == null) throw new IllegalArgumentException("Event is required");
    jdbc.update(
        "INSERT INTO analytics_daily(day,event,count) VALUES ((NOW() AT TIME ZONE"
            + " 'Asia/Colombo')::date,?,1) ON CONFLICT(day,event) DO UPDATE SET"
            + " count=analytics_daily.count+1",
        event.type());
  }

  @GetMapping("/api/v1/admin/analytics")
  public List<Map<String, Object>> summary() {
    return jdbc.queryForList(
        "SELECT event,sum(count) AS count FROM analytics_daily WHERE day >= ((NOW() AT TIME ZONE"
            + " 'Asia/Colombo')::date-30) GROUP BY event ORDER BY event");
  }
}
