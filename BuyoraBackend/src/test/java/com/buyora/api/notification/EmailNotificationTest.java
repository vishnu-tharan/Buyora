package com.buyora.api.notification;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.notification.service.*;
import org.junit.jupiter.api.Test;

class EmailNotificationTest {
  @Test
  void resetLinkIsDurablyQueuedForTheAccountEmail() {
    var outbox = mock(EmailOutbox.class);
    var service = new EmailNotificationService(outbox, new BuyoraProperties());
    service.sendPasswordReset(
        "customer@example.test",
        "Customer",
        "https://shop.example.test/reset-password?token=one-time-token");
    verify(outbox)
        .enqueue(
            eq("customer@example.test"),
            eq("Reset your Buyora password"),
            contains("https://shop.example.test/reset-password?token=one-time-token"));
  }

  @Test
  void orderEmailDoesNotClaimPaymentSucceeded() {
    var outbox = mock(EmailOutbox.class);
    var service = new EmailNotificationService(outbox, new BuyoraProperties());
    service.sendOrderConfirmation("customer@example.test", "Customer", "ORD-1");
    verify(outbox)
        .enqueue(eq("customer@example.test"), anyString(), contains("does not confirm payment"));
  }
}
