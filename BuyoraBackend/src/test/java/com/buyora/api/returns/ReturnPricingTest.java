package com.buyora.api.returns;

import static org.assertj.core.api.Assertions.*;

import com.buyora.api.order.entity.*;
import com.buyora.api.returns.service.ReturnPricing;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.Test;

class ReturnPricingTest {
  Order order(String... totals) {
    var o = new Order();
    o.setSubtotal(
        Arrays.stream(totals).map(BigDecimal::new).reduce(BigDecimal.ZERO, BigDecimal::add));
    o.setDiscountAmount(new BigDecimal("10"));
    o.setShippingAmount(new BigDecimal("5"));
    o.setTaxAmount(BigDecimal.ZERO);
    o.setTotal(o.getSubtotal().subtract(o.getDiscountAmount()).add(o.getShippingAmount()));
    for (int i = 0; i < totals.length; i++) {
      var item = new OrderItem();
      item.setId((long) i + 1);
      item.setTotal(new BigDecimal(totals[i]));
      o.addItem(item);
    }
    return o;
  }

  @Test
  void partialReturnAllocatesDiscountAndExcludesDelivery() {
    var o = order("60", "40");
    assertThat(ReturnPricing.amount(o, Set.of(1L))).isEqualByComparingTo("54");
    assertThat(ReturnPricing.amount(o, Set.of(2L))).isEqualByComparingTo("36");
  }

  @Test
  void wholeReturnMatchesExactlyThePaidTotal() {
    var o = order("60", "40");
    assertThat(ReturnPricing.amount(o, Set.of(1L, 2L))).isEqualByComparingTo(o.getTotal());
  }

  @Test
  void roundingDoesNotRefundMoreThanTheMerchandiseTotal() {
    var o = order("11", "11", "11");
    var total =
        ReturnPricing.amount(o, Set.of(1L))
            .add(ReturnPricing.amount(o, Set.of(2L)))
            .add(ReturnPricing.amount(o, Set.of(3L)));
    assertThat(total).isEqualByComparingTo("23.00");
  }
}
