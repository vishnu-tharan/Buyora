package com.buyora.api.shipping.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ShippingMethodDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal baseRate;
}
