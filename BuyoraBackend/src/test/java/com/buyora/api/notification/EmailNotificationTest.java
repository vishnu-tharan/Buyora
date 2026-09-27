package com.buyora.api.notification;
import com.buyora.api.notification.service.EmailNotificationService;
import com.buyora.api.common.config.BuyoraProperties;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
class EmailNotificationTest {
 @Test void resetLinkIsDeliveredToTheAccountEmail() {
  var sender=mock(JavaMailSender.class); var config=new BuyoraProperties();
  config.getEmail().setFromAddress("store@example.test");
  var service=new EmailNotificationService(sender,config);
  service.sendPasswordReset("customer@example.test","Customer","https://shop.example.test/reset-password?token=one-time-token");
  var message=ArgumentCaptor.forClass(SimpleMailMessage.class); verify(sender).send(message.capture());
  assertThat(message.getValue().getTo()).containsExactly("customer@example.test");
  assertThat(message.getValue().getFrom()).isEqualTo("store@example.test");
  assertThat(message.getValue().getText()).contains("https://shop.example.test/reset-password?token=one-time-token");
 }
 @Test void orderEmailDoesNotClaimPaymentSucceeded() {
  var sender=mock(JavaMailSender.class); var service=new EmailNotificationService(sender,new BuyoraProperties());
  service.sendOrderConfirmation("customer@example.test","Customer","ORD-1");
  var message=ArgumentCaptor.forClass(SimpleMailMessage.class); verify(sender).send(message.capture());
  assertThat(message.getValue().getText()).contains("does not confirm payment");
 }
}
