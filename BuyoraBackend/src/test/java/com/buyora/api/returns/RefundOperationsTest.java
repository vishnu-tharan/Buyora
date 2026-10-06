package com.buyora.api.returns;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.buyora.api.payment.service.PayhereMerchantClient;
import com.buyora.api.returns.service.RefundOperations;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

class RefundOperationsTest {
  JdbcTemplate jdbc = mock(JdbcTemplate.class);
  PayhereMerchantClient merchant = mock(PayhereMerchantClient.class);
  PlatformTransactionManager transactions = mock(PlatformTransactionManager.class);
  RefundOperations operations = new RefundOperations(jdbc, merchant, transactions);
  UUID publicId = UUID.randomUUID();
  Map<String, Object> row = new HashMap<>();
  ObjectMapper json = new ObjectMapper();

  @BeforeEach
  void setup() throws Exception {
    when(transactions.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
    row.put("id", 1L);
    row.put("order_id", 2L);
    row.put("status", "RECEIVED");
    row.put("refund_state", "NOT_REQUESTED");
    row.put("refund_amount", new BigDecimal("50"));
    row.put("payment_method", "PAYHERE");
    row.put("payment_status", "PAID");
    row.put("order_number", "ORD-1");
    row.put("total", new BigDecimal("100"));
    row.put("amount", new BigDecimal("100"));
    row.put("currency", "LKR");
    row.put("provider_payment_id", "123");
    when(jdbc.queryForList(anyString(), eq(publicId))).thenReturn(List.of(row));
    when(jdbc.queryForObject(anyString(), eq(Long.class), eq(2L))).thenReturn(0L);
    when(jdbc.queryForObject(anyString(), eq(BigDecimal.class), eq(2L)))
        .thenReturn(BigDecimal.ZERO);
    when(merchant.configured()).thenReturn(true);
    when(merchant.search("ORD-1"))
        .thenReturn(
            json.readTree(
                "{\"status\":1,\"data\":[{\"order_id\":\"ORD-1\",\"payment_id\":123,\"currency\":\"LKR\",\"amount\":100,\"status\":\"RECEIVED\"}]}"));
  }

  @Test
  void acceptedRefundRemainsRequestedUntilConfirmed() throws Exception {
    when(merchant.refund(eq("123"), eq(new BigDecimal("50")), anyString()))
        .thenReturn(json.readTree("{\"status\":1,\"data\":\"RF-123\"}"));
    assertThat(operations.refund(publicId, new RefundOperations.Request(null)))
        .containsEntry("state", "REQUESTED");
    verify(jdbc, never()).update(startsWith("UPDATE orders"), any(), any());
  }

  @Test
  void timeoutIsUnknownAndNeverRetriedAutomatically() {
    when(merchant.refund(eq("123"), eq(new BigDecimal("50")), anyString()))
        .thenThrow(new IllegalStateException("timeout"));
    assertThatThrownBy(() -> operations.refund(publicId, new RefundOperations.Request(null)))
        .hasMessageContaining("reconciliation");
    verify(jdbc).update(contains("refund_state='UNKNOWN'"), eq(1L));
    verify(merchant, times(1)).refund(anyString(), any(), anyString());
  }

  @Test
  void unresolvedRefundCannotBeSubmittedAgain() {
    row.put("refund_state", "UNKNOWN");
    assertThatThrownBy(() -> operations.refund(publicId, new RefundOperations.Request(null)))
        .hasMessageContaining("twice");
    verify(merchant, never()).refund(anyString(), any(), anyString());
  }

  @Test
  void cashRefundRequiresCompletedRepaymentReference() {
    row.put("payment_method", "CASH_ON_DELIVERY");
    assertThatThrownBy(() -> operations.refund(publicId, new RefundOperations.Request(null)))
        .hasMessageContaining("repayment reference");
    verify(merchant, never()).refund(anyString(), any(), anyString());
  }
}
