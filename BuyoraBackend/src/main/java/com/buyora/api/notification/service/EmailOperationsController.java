package com.buyora.api.notification.service;

import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class EmailOperationsController {
  private final JdbcTemplate jdbc;

  @GetMapping("/api/v1/admin/email-operations")
  public Map<String, Object> status() {
    return jdbc.queryForMap(
        "SELECT COUNT(*) FILTER(WHERE sent_at IS NULL AND attempts<8) AS pending,COUNT(*)"
            + " FILTER(WHERE sent_at IS NULL AND attempts>=8) AS failed,COUNT(*) FILTER(WHERE"
            + " sent_at IS NOT NULL) AS sent FROM email_outbox");
  }
}
