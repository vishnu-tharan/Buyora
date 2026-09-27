package com.buyora.api.payment.repository;

import com.buyora.api.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPublicId(UUID publicId);
    Optional<Payment> findByOrder_OrderNumber(String orderNumber);
}
