package com.buyora.api.payment.service;

import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.payment.dto.InitiatePaymentRequest;
import com.buyora.api.payment.dto.PaymentInitiationResponse;
import com.buyora.api.payment.entity.Payment;
import com.buyora.api.payment.entity.PaymentStatus;
import com.buyora.api.payment.entity.PaymentWebhook;
import com.buyora.api.payment.provider.PaymentProvider;
import com.buyora.api.payment.repository.PaymentRepository;
import com.buyora.api.payment.repository.PaymentWebhookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentWebhookRepository paymentWebhookRepository;
    private final List<PaymentProvider> paymentProviders;

    @Transactional
    public PaymentInitiationResponse initiatePayment(InitiatePaymentRequest request, Long userId, String guestId) {
        Order order = orderRepository.findForUpdate(request.orderNumber())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!(userId != null && userId.equals(order.getUserId())) && !(order.getUserId() == null && guestId != null && guestId.equals(order.getGuestCartId()))) {
            throw new IllegalArgumentException("Unauthorized to pay for this order");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Order is not in PENDING_PAYMENT status");
        }

        PaymentProvider provider = paymentProviders.stream()
                .filter(p -> p.supports(request.paymentMethod()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported payment method"));

        if (!request.paymentMethod().equals(order.getPaymentMethod())) {
            throw new IllegalArgumentException("Payment method does not match order");
        }
        var existing = paymentRepository.findByOrder_OrderNumber(order.getOrderNumber());
        if (existing.isPresent()) {
            if (existing.get().getStatus() != PaymentStatus.PENDING) throw new IllegalStateException("Payment already finalized");
            return provider.initiate(order, existing.get());
        }
        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotal())
                .paymentMethod(request.paymentMethod())
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);

        return provider.initiate(order, payment);
    }

    @Transactional(readOnly = true)
    public com.buyora.api.payment.dto.PaymentStatusResponse getStatus(java.util.UUID paymentId, Long userId, String guestId) {
        Payment payment = paymentRepository.findByPublicId(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        var order = payment.getOrder();
        if (!(userId != null && userId.equals(order.getUserId())) && !(order.getUserId() == null && guestId != null && guestId.equals(order.getGuestCartId()))) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return new com.buyora.api.payment.dto.PaymentStatusResponse(paymentId, payment.getStatus().name(), payment.getOrder().getOrderNumber());
    }

    @Transactional
    public void processWebhook(String provider, String payload) {
        PaymentWebhook webhook = PaymentWebhook.builder()
                .provider(provider)
                .payload(payload)
                .processed(false)
                .build();
        paymentWebhookRepository.save(webhook);
    }
}
