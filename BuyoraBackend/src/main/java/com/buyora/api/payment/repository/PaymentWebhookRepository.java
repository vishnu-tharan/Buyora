package com.buyora.api.payment.repository;

import com.buyora.api.payment.entity.PaymentWebhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhook, Long> {
}
