package com.buyora.api.notification;

import static org.mockito.Mockito.*;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.notification.service.EmailOutbox;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class EmailOutboxTest {
  @Test
  void failedMailIsScheduledForRetryAndNotMarkedSent() {
    var jdbc = mock(JdbcTemplate.class);
    var mail = mock(JavaMailSender.class);
    var outbox = new EmailOutbox(jdbc, mail, new BuyoraProperties());
    when(jdbc.queryForList(anyString()))
        .thenReturn(
            List.of(
                Map.of(
                    "id",
                    1L,
                    "recipient",
                    "customer@example.test",
                    "subject",
                    "Order",
                    "body",
                    "Details",
                    "attempts",
                    0)));
    doThrow(new org.springframework.mail.MailSendException("offline"))
        .when(mail)
        .send(any(SimpleMailMessage.class));
    outbox.deliver();
    verify(jdbc).update(contains("attempts=?"), eq(1), eq(60), eq(1L));
    verify(jdbc, never()).update(contains("sent_at=NOW()"), any(Object.class));
  }

  @Test
  void deliveredMessageBodyIsCleared() {
    var jdbc = mock(JdbcTemplate.class);
    var mail = mock(JavaMailSender.class);
    var outbox = new EmailOutbox(jdbc, mail, new BuyoraProperties());
    when(jdbc.queryForList(anyString()))
        .thenReturn(
            List.of(
                Map.of(
                    "id",
                    1L,
                    "recipient",
                    "customer@example.test",
                    "subject",
                    "Order",
                    "body",
                    "Details",
                    "attempts",
                    0)));
    outbox.deliver();
    verify(jdbc).update(contains("body=''"), eq(1L));
  }
}
