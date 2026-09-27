package com.buyora.api.coupon.service;

import com.buyora.api.coupon.entity.Coupon;
import com.buyora.api.common.exception.BusinessException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
public class CouponPricing {
    public BigDecimal discount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null) return BigDecimal.ZERO;
        Instant now = Instant.now();
        if (!Boolean.TRUE.equals(coupon.getActive())
                || coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())
                || coupon.getValidTo() != null && !now.isBefore(coupon.getValidTo())
                || coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()
                || coupon.getMinPurchaseAmount() != null && subtotal.compareTo(coupon.getMinPurchaseAmount()) < 0) {
            throw new BusinessException("INVALID_COUPON", "Coupon is not available for this order");
        }
        if (coupon.getValue() == null || coupon.getValue().signum() < 0) {
            throw new BusinessException("INVALID_COUPON", "Coupon value is invalid");
        }
        BigDecimal discount = switch (coupon.getType()) {
            case "FIXED" -> coupon.getValue();
            case "PERCENTAGE" -> subtotal.multiply(coupon.getValue().min(new BigDecimal("100")))
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            case "FREE_SHIPPING" -> BigDecimal.ZERO;
            default -> throw new BusinessException("INVALID_COUPON", "Coupon type is not supported");
        };
        if (coupon.getMaxDiscountAmount() != null) discount = discount.min(coupon.getMaxDiscountAmount());
        return discount.min(subtotal).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }
}
