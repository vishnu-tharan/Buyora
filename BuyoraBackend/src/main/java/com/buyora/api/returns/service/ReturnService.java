package com.buyora.api.returns.service;

import com.buyora.api.common.exception.BusinessException;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.returns.dto.CreateReturnRequest;
import com.buyora.api.returns.dto.ReturnResponse;
import com.buyora.api.returns.entity.Return;
import com.buyora.api.returns.repository.ReturnRepository;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReturnService {

  private final com.buyora.api.common.config.BuyoraProperties properties;
  private final ReturnRepository returnRepository;
  private final OrderRepository orderRepository;
  private final UserRepository userRepository;
  private final org.springframework.jdbc.core.JdbcTemplate jdbc;
  private final com.buyora.api.store.StoreSettings settings;

  @Transactional
  public ReturnResponse createReturn(String orderNumber, Long userId, CreateReturnRequest request) {
    Order order =
        orderRepository
            .findForUpdate(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (order.getUserId() == null || !order.getUserId().equals(user.getId())) {
      throw new BusinessException("INVALID_USER", "Order does not belong to user");
    }

    if (order.getStatus() != OrderStatus.DELIVERED) {
      throw new BusinessException("INVALID_STATUS", "Only delivered orders can be returned");
    }

    var deliveredAt =
        order.getHistory().stream()
            .filter(entry -> entry.getStatus() == OrderStatus.DELIVERED)
            .map(entry -> entry.getCreatedAt())
            .filter(java.util.Objects::nonNull)
            .max(java.time.Instant::compareTo)
            .orElseThrow(
                () ->
                    new BusinessException(
                        "DELIVERY_DATE_MISSING", "Contact the store to confirm the delivery date"));
    if (deliveredAt
        .plus(settings.get().returnWindowDays(), java.time.temporal.ChronoUnit.DAYS)
        .isBefore(java.time.Instant.now()))
      throw new BusinessException("RETURN_WINDOW_CLOSED", "The return request period has ended");

    var requested = new java.util.HashSet<>(request.getItemIds());
    var allItems =
        order.getItems().stream().map(i -> i.getId()).collect(java.util.stream.Collectors.toSet());
    if (requested.size() != request.getItemIds().size() || !allItems.containsAll(requested))
      throw new BusinessException("INVALID_ITEMS", "Select distinct items from this order");
    var claimed =
        jdbc.queryForList(
            "SELECT ri.order_item_id FROM return_items ri JOIN returns r ON r.id=ri.return_id WHERE"
                + " r.order_id=? AND r.status<>\'REJECTED\'",
            Long.class,
            order.getId());
    if (requested.stream().anyMatch(claimed::contains))
      throw new BusinessException("ITEM_ALREADY_RETURNED", "An item already has a return request");
    Return ret =
        Return.builder()
            .order(order)
            .user(user)
            .reason(
                request.getReason() + (request.getNotes() == null ? "" : "\n" + request.getNotes()))
            .refundAmount(ReturnPricing.amount(order, requested))
            .build();

    ret = returnRepository.saveAndFlush(ret);
    for (Long item : requested)
      jdbc.update(
          "INSERT INTO return_items(return_id,order_item_id) VALUES (?,?)", ret.getId(), item);

    return mapToResponse(ret);
  }

  @Transactional(readOnly = true)
  public Page<ReturnResponse> getAllReturns(Pageable pageable) {
    return returnRepository.findAll(pageable).map(this::mapToResponse);
  }

  @Transactional
  public ReturnResponse updatePublicStatus(java.util.UUID id, String status) {
    var ret =
        returnRepository
            .findByPublicId(id)
            .orElseThrow(() -> new ResourceNotFoundException("Return not found"));
    return updateReturnStatus(ret.getId(), status);
  }

  @Transactional
  public ReturnResponse updateReturnStatus(Long id, String status) {
    Return ret =
        returnRepository
            .findForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Return not found"));
    boolean allowed =
        switch (ret.getStatus()) {
          case "PENDING" -> "APPROVED".equals(status) || "REJECTED".equals(status);
          case "APPROVED" -> "RECEIVED".equals(status);
          default -> false;
        };
    if (!allowed)
      throw new BusinessException(
          "INVALID_STATUS",
          "Invalid return transition; refunds require confirmed payment-provider processing");
    ret.setStatus(status);
    ret = returnRepository.saveAndFlush(ret);
    return mapToResponse(ret);
  }

  @Transactional(readOnly = true)
  public java.util.List<ReturnResponse> forOrder(String number, Long userId) {
    var order =
        orderRepository
            .findByOrderNumberAndUserId(number, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    return returnRepository.findByOrderIdOrderByCreatedAtDesc(order.getId()).stream()
        .map(this::mapToResponse)
        .toList();
  }

  private ReturnResponse mapToResponse(Return ret) {
    return ReturnResponse.builder()
        .id(ret.getPublicId())
        .orderId(ret.getOrder().getPublicId())
        .orderNumber(ret.getOrder().getOrderNumber())
        .items(
            jdbc.queryForList(
                "SELECT i.id,i.product_name AS name,i.sku,i.quantity FROM return_items ri JOIN"
                    + " order_items i ON i.id=ri.order_item_id WHERE ri.return_id=? ORDER BY i.id",
                ret.getId()))
        .itemIds(
            jdbc.queryForList(
                "SELECT order_item_id FROM return_items WHERE return_id=? ORDER BY order_item_id",
                Long.class,
                ret.getId()))
        .refundState(ret.getRefundState())
        .refundReference(ret.getRefundReference())
        .status(ret.getStatus())
        .reason(ret.getReason())
        .refundAmount(ret.getRefundAmount())
        .createdAt(ret.getCreatedAt())
        .build();
  }
}
