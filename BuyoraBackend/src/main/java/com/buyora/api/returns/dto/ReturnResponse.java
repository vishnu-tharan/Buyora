package com.buyora.api.returns.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReturnResponse {
  private UUID id;
  private UUID orderId;
  private String status;
  private String orderNumber;
  private java.util.List<Long> itemIds;
  private java.util.List<java.util.Map<String, Object>> items;
  private String refundState;
  private String refundReference;
  private String reason;
  private BigDecimal refundAmount;
  private OffsetDateTime createdAt;
}
