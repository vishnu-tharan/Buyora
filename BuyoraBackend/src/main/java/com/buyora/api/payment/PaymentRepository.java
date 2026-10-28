package com.buyora.api.payment;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findByPublicId(UUID publicId);

  Optional<Payment> findByOrder_OrderNumber(String orderNumber);
}
