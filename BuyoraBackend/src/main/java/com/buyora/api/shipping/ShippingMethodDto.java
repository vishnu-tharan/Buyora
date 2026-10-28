package com.buyora.api.shipping;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShippingMethodDto {
  private Long id;
  private String name;
  private String description;
  private BigDecimal baseRate;
}
