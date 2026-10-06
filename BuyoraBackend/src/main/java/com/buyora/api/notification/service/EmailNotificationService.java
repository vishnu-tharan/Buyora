package com.buyora.api.notification.service;

import com.buyora.api.common.config.BuyoraProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService implements NotificationService {
  private final EmailOutbox outbox;
  private final BuyoraProperties properties;

  private void send(String recipient, String subject, String body) {
    outbox.enqueue(recipient, subject, body);
  }

  @Override
  public void sendEmailVerification(String email, String firstName, String verificationUrl) {
    send(
        email,
        "Verify your Buyora email",
        "Hello "
            + firstName
            + ",\n\nConfirm your email address using this link:\n"
            + verificationUrl
            + "\n\nIf you did not create this account, ignore this email.");
  }

  @Override
  public void sendPasswordReset(String email, String firstName, String resetUrl) {
    send(
        email,
        "Reset your Buyora password",
        "Hello "
            + firstName
            + ",\n\nReset your password using this one-time link:\n"
            + resetUrl
            + "\n\nThe link expires in one hour. If you did not request this, ignore this email.");
  }

  @Override
  public void sendWelcome(String email, String firstName) {
    send(email, "Welcome to Buyora", "Hello " + firstName + ",\n\nYour Buyora account is ready.");
  }

  @Override
  public void sendOrderConfirmation(String email, String firstName, String orderNumber) {
    send(
        email,
        "Buyora order " + orderNumber,
        "Your order "
            + orderNumber
            + " has been created. This email does not confirm payment. Check the order page for its"
            + " latest status.");
  }

  @Override
  public void sendOrderShipped(
      String email, String firstName, String orderNumber, String trackingNumber) {
    send(
        email,
        "Buyora order shipped: " + orderNumber,
        "Your order " + orderNumber + " has shipped. Tracking reference: " + trackingNumber);
  }
}
