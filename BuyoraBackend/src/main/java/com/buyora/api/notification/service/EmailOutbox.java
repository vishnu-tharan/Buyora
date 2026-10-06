package com.buyora.api.notification.service;

import com.buyora.api.common.config.BuyoraProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailOutbox {
  private final JdbcTemplate jdbc;
  private final JavaMailSender mail;
  private final BuyoraProperties properties;

  @Transactional
  public void enqueue(String recipient, String subject, String body) {
    if (recipient == null || recipient.isBlank())
      throw new IllegalArgumentException("Email recipient is required");
    jdbc.update(
        "INSERT INTO email_outbox(recipient,subject,body) VALUES (?,?,?)",
        recipient,
        subject,
        body);
  }

  // The row lock prevents concurrent workers sending the same message. SMTP is at-least-once:
  // a crash after delivery but before commit can cause a duplicate message.
  @Scheduled(fixedDelayString = "${buyora.email.retry-delay-ms:30000}")
  @Transactional
  public void deliver() {
    var rows =
        jdbc.queryForList(
            "SELECT id,recipient,subject,body,attempts FROM email_outbox WHERE sent_at IS NULL AND"
                + " attempts<8 AND next_attempt_at<=NOW() ORDER BY id LIMIT 10 FOR UPDATE SKIP"
                + " LOCKED");
    for (var row : rows) {
      var message = new SimpleMailMessage();
      message.setFrom(properties.getEmail().getFromAddress());
      message.setTo((String) row.get("recipient"));
      message.setSubject((String) row.get("subject"));
      message.setText((String) row.get("body"));
      try {
        mail.send(message);
        jdbc.update(
            "UPDATE email_outbox SET sent_at=NOW(),body='',last_error=NULL WHERE id=?",
            row.get("id"));
      } catch (org.springframework.mail.MailException ex) {
        int attempts = ((Number) row.get("attempts")).intValue() + 1;
        jdbc.update(
            "UPDATE email_outbox SET attempts=?,next_attempt_at=NOW()+(? * INTERVAL '1"
                + " second'),last_error='DELIVERY_FAILED' WHERE id=?",
            attempts,
            Math.min(3600, 30 * (1 << attempts)),
            row.get("id"));
        log.warn("Email delivery queued for retry, message {}", row.get("id"));
      }
    }
  }
}
