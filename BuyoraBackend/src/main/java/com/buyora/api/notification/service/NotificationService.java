package com.buyora.api.notification.service;

public interface NotificationService {
    void sendEmailVerification(String email, String firstName, String verificationUrl);
    void sendPasswordReset(String email, String firstName, String resetUrl);
    void sendWelcome(String email, String firstName);
    void sendOrderConfirmation(String email, String firstName, String orderNumber);
    void sendOrderShipped(String email, String firstName, String orderNumber, String trackingNumber);
}
