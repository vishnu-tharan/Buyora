package com.buyora.api.order.service;

import com.buyora.api.order.dto.OrderResponse;
import com.buyora.api.order.mapper.OrderMapper;
import com.buyora.api.order.repository.OrderRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TrackingController {
  private final OrderRepository orders;
  private final OrderMapper mapper;
  private final com.buyora.api.notification.service.NotificationService notifications;

  public record Tracking(
      @NotBlank @Size(max = 100) String trackingNumber, @Size(max = 1000) String trackingUrl) {}

  @PutMapping("/api/v1/admin/orders/{number}/tracking")
  @Transactional
  public OrderResponse save(@PathVariable String number, @Valid @RequestBody Tracking tracking) {
    var order =
        orders
            .findForUpdate(number)
            .orElseThrow(
                () ->
                    new com.buyora.api.common.exception.ResourceNotFoundException(
                        "Order not found"));
    if (!java.util.Set.of(
            com.buyora.api.order.entity.OrderStatus.SHIPPED,
            com.buyora.api.order.entity.OrderStatus.OUT_FOR_DELIVERY,
            com.buyora.api.order.entity.OrderStatus.DELIVERED)
        .contains(order.getStatus()))
      throw new IllegalArgumentException("Tracking can be saved after the order is shipped");
    if (tracking.trackingUrl() != null && !tracking.trackingUrl().isBlank())
      validateUrl(tracking.trackingUrl());
    order.setTrackingNumber(tracking.trackingNumber());
    order.setTrackingUrl(tracking.trackingUrl());
    notifications.sendOrderShipped(
        order.getGuestEmail(), "", order.getOrderNumber(), tracking.trackingNumber());
    return mapper.toResponse(orders.save(order));
  }

  public static void validateUrl(String value) {
    try {
      var uri = java.net.URI.create(value);
      if (!"https".equalsIgnoreCase(uri.getScheme())
          || uri.getHost() == null
          || uri.getUserInfo() != null)
        throw new IllegalArgumentException("Use the courier’s HTTPS tracking URL");
    } catch (RuntimeException e) {
      throw new IllegalArgumentException("Use the courier’s HTTPS tracking URL");
    }
  }
}
