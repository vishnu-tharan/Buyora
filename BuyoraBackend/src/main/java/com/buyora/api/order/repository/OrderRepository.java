package com.buyora.api.order.repository;

import com.buyora.api.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Order> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select o from Order o where o.orderNumber = :number")
    Optional<Order> findForUpdate(@org.springframework.data.repository.query.Param("number") String number);
    java.util.List<Order> findTop10ByOrderByCreatedAtDesc();
    java.util.List<Order> findByCreatedAtAfter(java.time.Instant since);
    long countByStatus(com.buyora.api.order.entity.OrderStatus status);
    long countByUserId(Long userId);
    @org.springframework.data.jpa.repository.Query("select coalesce(sum(o.total), 0) from Order o where o.userId = :userId and o.paymentStatus = com.buyora.api.order.entity.PaymentStatus.PAID")
    java.math.BigDecimal paidTotalForUser(@org.springframework.data.repository.query.Param("userId") Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);
    Page<Order> findAllByUserId(Long userId, Pageable pageable);
    @org.springframework.data.jpa.repository.Query("select (count(i) > 0) from OrderItem i where i.order.userId = :userId and i.productId = :productId and i.order.status = com.buyora.api.order.entity.OrderStatus.DELIVERED")
    boolean hasDeliveredProduct(@org.springframework.data.repository.query.Param("userId") Long userId,
                                @org.springframework.data.repository.query.Param("productId") Long productId);
}
