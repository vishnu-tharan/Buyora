package com.buyora.api.order.service;

import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.entity.OrderStatusHistory;
import com.buyora.api.order.mapper.OrderMapper;
import com.buyora.api.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

  private final OrderRepository orderRepository;
  private final OrderMapper orderMapper;
  private final com.buyora.api.payment.repository.PaymentRepository payments;
  private final com.buyora.api.inventory.service.InventoryService inventoryService;

  @Override
  @Transactional(readOnly = true)
  public OrderResponse getOrder(String orderNumber, Long userId, String guestId) {
    Order order =
        orderRepository
            .findByOrderNumber(orderNumber)
            .orElseThrow(
                () ->
                    new com.buyora.api.common.exception.ResourceNotFoundException(
                        "Order not found"));

    if (!(userId != null && userId.equals(order.getUserId()))
        && !(order.getUserId() == null
            && guestId != null
            && guestId.equals(order.getGuestCartId()))) {
      throw new org.springframework.security.access.AccessDeniedException("Order access denied");
    }
    return orderMapper.toResponse(order);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<OrderResponse> getUserOrders(
      Long userId, OrderStatus status, String q, Pageable pageable) {
    return orderRepository
        .findAll(
            (root, query, cb) -> {
              var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
              predicates.add(cb.equal(root.get("userId"), userId));
              if (status != null) predicates.add(cb.equal(root.get("status"), status));
              if (q != null && !q.isBlank())
                predicates.add(
                    cb.like(
                        cb.lower(root.get("orderNumber")),
                        "%"
                            + q.trim()
                                .toLowerCase(java.util.Locale.ROOT)
                                .replace("%", "")
                                .replace("_", "")
                            + "%"));
              return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
            },
            pageable)
        .map(orderMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public OrderResponse getAdminOrder(String orderNumber) {
    return orderMapper.toResponse(
        orderRepository
            .findByOrderNumber(orderNumber)
            .orElseThrow(
                () ->
                    new com.buyora.api.common.exception.ResourceNotFoundException(
                        "Order not found")));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<OrderResponse> getAllOrders(Pageable pageable) {
    return orderRepository.findAll(pageable).map(orderMapper::toResponse);
  }

  @Override
  @Transactional
  public OrderResponse updateOrderStatus(String orderNumber, OrderStatus newStatus, String notes) {
    Order order =
        orderRepository
            .findForUpdate(orderNumber)
            .orElseThrow(
                () ->
                    new com.buyora.api.common.exception.ResourceNotFoundException(
                        "Order not found"));

    boolean allowed =
        switch (order.getStatus()) {
          case PAYMENT_CONFIRMED -> newStatus == OrderStatus.PROCESSING;
          case PROCESSING -> newStatus == OrderStatus.PACKED;
          case PACKED -> newStatus == OrderStatus.SHIPPED;
          case SHIPPED -> newStatus == OrderStatus.OUT_FOR_DELIVERY;
          case OUT_FOR_DELIVERY -> newStatus == OrderStatus.DELIVERED;
          default -> false;
        };
    if (!allowed) throw new IllegalArgumentException("Invalid order status transition");
    order.setStatus(newStatus);
    if (newStatus == OrderStatus.DELIVERED && "CASH_ON_DELIVERY".equals(order.getPaymentMethod()))
      order.setPaymentStatus(com.buyora.api.order.entity.PaymentStatus.PAID);

    OrderStatusHistory history = new OrderStatusHistory();
    history.setStatus(newStatus);
    history.setNotes(notes);
    order.addHistory(history);

    return orderMapper.toResponse(orderRepository.save(order));
  }

  @Override
  @Transactional
  public OrderResponse cancelOrder(String orderNumber, Long userId, String reason) {
    Order order =
        orderRepository
            .findForUpdate(orderNumber)
            .orElseThrow(
                () ->
                    new com.buyora.api.common.exception.ResourceNotFoundException(
                        "Order not found"));

    if (userId == null || !userId.equals(order.getUserId())) {
      throw new org.springframework.security.access.AccessDeniedException("Order access denied");
    }

    if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
      throw new IllegalArgumentException("Order cannot be cancelled");
    }

    if (payments.findByOrder_OrderNumber(orderNumber).isPresent())
      throw new com.buyora.api.common.exception.BusinessException(
          "PAYMENT_IN_PROGRESS",
          "This payment has been initiated. Contact the store to check its outcome before"
              + " cancellation.");
    inventoryService.releaseStock(orderNumber);
    order.setStatus(OrderStatus.CANCELLED);
    OrderStatusHistory history = new OrderStatusHistory();
    history.setStatus(OrderStatus.CANCELLED);
    history.setNotes("Cancelled by user: " + reason);
    order.addHistory(history);

    return orderMapper.toResponse(orderRepository.save(order));
  }
}
