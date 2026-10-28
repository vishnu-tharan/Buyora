package com.buyora.api.payment;

import com.buyora.api.order.Order;
import com.buyora.api.order.OrderRepository;
import com.buyora.api.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final OrderRepository orderRepository;
  private final PaymentRepository paymentRepository;
  private final PaymentWebhookRepository paymentWebhookRepository;
  private final PayhereProvider payhere;

  @Transactional
  public PaymentInitiationResponse initiatePayment(
      InitiatePaymentRequest request, Long userId, String guestId) {
    Order order =
        orderRepository
            .findForUpdate(request.orderNumber())
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));

    if (!(userId != null && userId.equals(order.getUserId()))
        && !(order.getUserId() == null
            && guestId != null
            && guestId.equals(order.getGuestCartId()))) {
      throw new IllegalArgumentException("Unauthorized to pay for this order");
    }

    if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
      throw new IllegalStateException("Order is not in PENDING_PAYMENT status");
    }

    if (!payhere.supports(request.paymentMethod())) {
      throw new IllegalArgumentException("Unsupported payment method");
    }

    if (!request.paymentMethod().equals(order.getPaymentMethod())) {
      throw new IllegalArgumentException("Payment method does not match order");
    }
    var existing = paymentRepository.findByOrder_OrderNumber(order.getOrderNumber());
    if (existing.isPresent()) {
      if (existing.get().getStatus() != PaymentStatus.PENDING)
        throw new IllegalStateException("Payment already finalized");
      return payhere.initiate(order, existing.get());
    }
    Payment payment =
        Payment.builder()
            .order(order)
            .amount(order.getTotal())
            .paymentMethod(request.paymentMethod())
            .status(PaymentStatus.PENDING)
            .build();

    payment = paymentRepository.save(payment);

    return payhere.initiate(order, payment);
  }

  @Transactional(readOnly = true)
  public com.buyora.api.payment.PaymentStatusResponse getStatus(
      java.util.UUID paymentId, Long userId, String guestId) {
    Payment payment =
        paymentRepository
            .findByPublicId(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    var order = payment.getOrder();
    if (!(userId != null && userId.equals(order.getUserId()))
        && !(order.getUserId() == null
            && guestId != null
            && guestId.equals(order.getGuestCartId()))) {
      throw new org.springframework.security.access.AccessDeniedException("Access denied");
    }
    return new com.buyora.api.payment.PaymentStatusResponse(
        paymentId, payment.getStatus().name(), payment.getOrder().getOrderNumber());
  }

  @Transactional
  public void processWebhook(String provider, String payload) {
    PaymentWebhook webhook =
        PaymentWebhook.builder().provider(provider).payload(payload).processed(false).build();
    paymentWebhookRepository.save(webhook);
  }
}
