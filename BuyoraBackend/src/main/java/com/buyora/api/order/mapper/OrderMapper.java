package com.buyora.api.order.mapper;

import com.buyora.api.address.dto.AddressResponse;
import com.buyora.api.order.dto.OrderItemResponse;
import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.dto.OrderStatusHistoryResponse;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderItem;
import com.buyora.api.order.entity.OrderStatusHistory;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {
  private final com.fasterxml.jackson.databind.ObjectMapper json;
  private final org.springframework.jdbc.core.JdbcTemplate jdbc;
  private final com.buyora.api.store.StoreSettings settings;

  public OrderMapper(
      com.fasterxml.jackson.databind.ObjectMapper json,
      org.springframework.jdbc.core.JdbcTemplate jdbc,
      com.buyora.api.store.StoreSettings settings) {
    this.json = json;
    this.jdbc = jdbc;
    this.settings = settings;
  }

  public OrderResponse toResponse(Order order) {
    boolean canCancel =
        order.getStatus() == com.buyora.api.order.entity.OrderStatus.PENDING_PAYMENT
            && jdbc.queryForObject(
                    "SELECT COUNT(*) FROM payments WHERE order_id=?", Long.class, order.getId())
                == 0;
    var delivered =
        order.getHistory().stream()
            .filter(h -> h.getStatus() == com.buyora.api.order.entity.OrderStatus.DELIVERED)
            .map(com.buyora.api.order.entity.OrderStatusHistory::getCreatedAt)
            .filter(java.util.Objects::nonNull)
            .max(java.time.Instant::compareTo)
            .orElse(null);
    boolean canReturn =
        order.getUserId() != null
            && order.getStatus() == com.buyora.api.order.entity.OrderStatus.DELIVERED
            && delivered != null
            && delivered
                .plus(settings.get().returnWindowDays(), java.time.temporal.ChronoUnit.DAYS)
                .isAfter(java.time.Instant.now())
            && jdbc.queryForObject(
                    "SELECT COUNT(*) FROM order_items i WHERE i.order_id=? AND NOT EXISTS (SELECT 1"
                        + " FROM return_items ri JOIN returns r ON r.id=ri.return_id WHERE"
                        + " ri.order_item_id=i.id AND r.status<>\'REJECTED\')",
                    Long.class,
                    order.getId())
                > 0;

    return new OrderResponse(
        order.getId(),
        order.getOrderNumber(),
        order.getStatus().name(),
        order.getPaymentStatus().name(),
        order.getPaymentMethod(),
        order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()),
        order.getItems().stream().mapToInt(OrderItem::getQuantity).sum(),
        shippingAddress(order),
        order.getSubtotal(),
        order.getDiscountAmount(),
        order.getShippingAmount(),
        order.getTaxAmount(),
        order.getTotal(),
        order.getCouponCode(),
        order.getDeliveryMethod(),
        order.getEstimatedDelivery(),
        order.getTrackingNumber(),
        order.getTrackingUrl(),
        order.getHistory().stream().map(this::toHistoryResponse).collect(Collectors.toList()),
        order.getCustomerNotes(),
        canCancel,
        canReturn,
        order.getCreatedAt(),
        order.getUpdatedAt());
  }

  private AddressResponse shippingAddress(Order order) {
    try {
      return json.readValue(order.getShippingSnapshot(), AddressResponse.class);
    } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
      throw new IllegalStateException("Order address requires reconciliation", error);
    }
  }

  private OrderItemResponse toItemResponse(OrderItem item) {
    return new OrderItemResponse(
        item.getId(),
        new OrderItemResponse.ProductSnapshot(item.getProductId(), item.getProductName(), ""),
        new OrderItemResponse.VariantSnapshot(
            item.getVariantId(), item.getSku(), java.util.Map.of()),
        item.getPrice(),
        item.getQuantity(),
        item.getTotal(),
        java.math.BigDecimal.ZERO);
  }

  private OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
    return new OrderStatusHistoryResponse(
        history.getStatus().name(), history.getNotes(), history.getCreatedAt());
  }
}
