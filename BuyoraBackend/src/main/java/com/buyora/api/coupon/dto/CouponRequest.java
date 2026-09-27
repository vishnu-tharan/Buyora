package com.buyora.api.coupon.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
public record CouponRequest(@NotBlank @Pattern(regexp="[A-Z0-9_-]{3,50}") String code,
    @NotBlank @Pattern(regexp="PERCENTAGE|FIXED|FREE_SHIPPING") String type,
    @NotNull @DecimalMin("0") BigDecimal value, @DecimalMin("0") BigDecimal minimumOrderAmount,
    @DecimalMin("0") BigDecimal maximumDiscountAmount, @NotNull Instant startDate, Instant endDate,
    @Min(1) Integer usageLimit, boolean isActive) {}
