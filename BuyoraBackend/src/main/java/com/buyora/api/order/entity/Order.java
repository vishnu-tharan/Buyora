package com.buyora.api.order.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, unique = true, updatable = false)
  private UUID publicId = UUID.randomUUID();

  @Column(name = "user_id")
  private Long userId;

  @Column(name = "guest_cart_id")
  private String guestCartId;

  @Column(name = "idempotency_key", unique = true)
  private String idempotencyKey;

  @Column(name = "guest_email")
  private String guestEmail;

  @Column(name = "order_number", nullable = false, unique = true)
  private String orderNumber;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private OrderStatus status = OrderStatus.PENDING_PAYMENT;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_status", nullable = false, length = 30)
  private PaymentStatus paymentStatus = PaymentStatus.PENDING;

  @Column(name = "payment_method", nullable = false, length = 50)
  private String paymentMethod;

  @Column(name = "payment_id", length = 100)
  private String paymentId;

  @Column(name = "shipping_address_id")
  private Long shippingAddressId;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "shipping_snapshot", nullable = false, columnDefinition = "jsonb")
  private String shippingSnapshot;

  @Column(nullable = false, precision = 19, scale = 4)
  private BigDecimal subtotal;

  @Column(name = "discount_amount", nullable = false, precision = 19, scale = 4)
  private BigDecimal discountAmount = BigDecimal.ZERO;

  @Column(name = "shipping_amount", nullable = false, precision = 19, scale = 4)
  private BigDecimal shippingAmount = BigDecimal.ZERO;

  @Column(name = "tax_amount", nullable = false, precision = 19, scale = 4)
  private BigDecimal taxAmount = BigDecimal.ZERO;

  @Column(nullable = false, precision = 19, scale = 4)
  private BigDecimal total;

  @Column(name = "coupon_code", length = 50)
  private String couponCode;

  @Column(name = "delivery_method", length = 50)
  private String deliveryMethod;

  @Column(name = "estimated_delivery")
  private Instant estimatedDelivery;

  @Column(name = "tracking_number", length = 100)
  private String trackingNumber;

  @Column(name = "tracking_url", length = 1000)
  private String trackingUrl;

  @Column(name = "customer_notes")
  private String customerNotes;

  @Column(name = "admin_notes")
  private String adminNotes;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderStatusHistory> history = new ArrayList<>();

  public void addItem(OrderItem item) {
    items.add(item);
    item.setOrder(this);
  }

  public void addHistory(OrderStatusHistory statusHistory) {
    history.add(statusHistory);
    statusHistory.setOrder(this);
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = Instant.now();
  }
}
