package com.buyora.api.payment;
import com.buyora.api.payment.service.PaymentService;
import com.buyora.api.payment.dto.InitiatePaymentRequest;
import com.buyora.api.payment.repository.*;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.payment.entity.Payment;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
class PaymentSecurityTest {
    final OrderRepository orders = mock(OrderRepository.class);
    final PaymentRepository payments = mock(PaymentRepository.class);
    final PaymentService service = new PaymentService(orders, payments, mock(PaymentWebhookRepository.class), List.of());
    @Test void blocksAnotherCustomersPayment() {
        Order order = new Order(); order.setUserId(10L);
        when(orders.findForUpdate("ORD-1")).thenReturn(Optional.of(order));
        assertThatThrownBy(() -> service.initiatePayment(new InitiatePaymentRequest("ORD-1", "PAYHERE"), 20L, null)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(payments);
    }
    @Test void blocksPaymentStatusDisclosure() {
        Order order = new Order(); order.setUserId(10L);
        UUID id = UUID.randomUUID(); Payment payment = Payment.builder().order(order).build();
        when(payments.findByPublicId(id)).thenReturn(Optional.of(payment));
        assertThatThrownBy(() -> service.getStatus(id, 20L, null)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }
    @Test void requiresGuestCookieForGuestPaymentStatus() {
        Order order = new Order(); order.setGuestCartId("secret");
        UUID id = UUID.randomUUID(); Payment payment = Payment.builder().order(order).build();
        when(payments.findByPublicId(id)).thenReturn(Optional.of(payment));
        assertThatThrownBy(() -> service.getStatus(id, null, null)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }
}
