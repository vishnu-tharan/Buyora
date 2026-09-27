package com.buyora.api.payment.provider;

import com.buyora.api.order.entity.Order;
import com.buyora.api.payment.entity.Payment;
import com.buyora.api.payment.dto.PaymentInitiationResponse;

public interface PaymentProvider {
    String getProviderName();
    PaymentInitiationResponse initiate(Order order, Payment payment);
    boolean supports(String paymentMethod);
}
