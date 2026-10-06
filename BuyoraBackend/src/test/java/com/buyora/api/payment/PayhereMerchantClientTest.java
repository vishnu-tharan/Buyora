package com.buyora.api.payment;

import static org.assertj.core.api.Assertions.*;

import com.buyora.api.payment.service.PayhereMerchantClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PayhereMerchantClientTest {
  @Test
  void settlementRequiresMatchingOrderAmountCurrencyAndReference() throws Exception {
    var json = new ObjectMapper();
    var row =
        json.readTree(
            "{\"order_id\":\"ORD-1\",\"payment_id\":123,\"currency\":\"LKR\",\"amount\":100}");
    assertThat(PayhereMerchantClient.matches(row, "ORD-1", new BigDecimal("100"), "LKR")).isTrue();
    assertThat(PayhereMerchantClient.matches(row, "ORD-2", new BigDecimal("100"), "LKR")).isFalse();
    assertThat(PayhereMerchantClient.matches(row, "ORD-1", new BigDecimal("99"), "LKR")).isFalse();
    assertThat(PayhereMerchantClient.matches(row, "ORD-1", new BigDecimal("100"), "USD")).isFalse();
  }
}
