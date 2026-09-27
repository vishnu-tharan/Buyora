package com.buyora.api.returns.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ReturnResponse {
    private UUID id;
    private UUID orderId;
    private String status;
    private String reason;
    private BigDecimal refundAmount;
    private OffsetDateTime createdAt;
}
