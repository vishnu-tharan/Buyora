package com.buyora.api.returns.service;

import com.buyora.api.order.entity.Order;
import java.math.*;
import java.util.*;

public final class ReturnPricing {
  private ReturnPricing() {}

  public static BigDecimal amount(Order order, Set<Long> requested) {
    if (order.getSubtotal().signum() <= 0)
      return requested.size() == order.getItems().size() ? order.getTotal() : BigDecimal.ZERO;
    var items =
        order.getItems().stream()
            .sorted(Comparator.comparing(com.buyora.api.order.entity.OrderItem::getId))
            .toList();
    BigDecimal merchandise =
        order
            .getSubtotal()
            .subtract(order.getDiscountAmount())
            .add(order.getTaxAmount())
            .setScale(2, RoundingMode.HALF_UP);
    BigDecimal assigned = BigDecimal.ZERO, total = BigDecimal.ZERO;
    for (int i = 0; i < items.size(); i++) {
      var item = items.get(i);
      BigDecimal value =
          i == items.size() - 1
              ? merchandise.subtract(assigned)
              : merchandise
                  .multiply(item.getTotal())
                  .divide(order.getSubtotal(), 2, RoundingMode.HALF_UP);
      value = value.max(BigDecimal.ZERO).min(merchandise.subtract(assigned).max(BigDecimal.ZERO));
      assigned = assigned.add(value);
      if (requested.contains(item.getId())) total = total.add(value);
    }
    if (requested.size() == items.size()) total = total.add(order.getShippingAmount());
    return total.setScale(2, RoundingMode.HALF_UP);
  }
}
