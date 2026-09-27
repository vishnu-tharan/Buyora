package com.buyora.api.coupon;
import com.buyora.api.coupon.entity.Coupon;
import com.buyora.api.coupon.service.CouponPricing;
import com.buyora.api.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import static org.assertj.core.api.Assertions.*;
class CouponPricingTest {
    private final CouponPricing pricing = new CouponPricing();
    private Coupon coupon() { return Coupon.builder().code("SAVE").type("PERCENTAGE").value(new BigDecimal("25")).build(); }
    @Test void computesDiscountAndCap() {
        var coupon = coupon(); coupon.setMaxDiscountAmount(new BigDecimal("15"));
        assertThat(pricing.discount(coupon, new BigDecimal("100"))).isEqualByComparingTo("15");
    }
    @Test void rejectsExpiredCoupon() {
        var coupon = coupon(); coupon.setValidTo(Instant.now().minusSeconds(1));
        assertThatThrownBy(() -> pricing.discount(coupon, new BigDecimal("100"))).isInstanceOf(BusinessException.class);
    }
    @Test void rejectsExhaustedCoupon() {
        var coupon = coupon(); coupon.setUsageLimit(1); coupon.setUsedCount(1);
        assertThatThrownBy(() -> pricing.discount(coupon, new BigDecimal("100"))).isInstanceOf(BusinessException.class);
    }
    @Test void fixedDiscountCannotExceedSubtotal() {
        var coupon = coupon(); coupon.setType("FIXED"); coupon.setValue(new BigDecimal("500"));
        assertThat(pricing.discount(coupon, new BigDecimal("100"))).isEqualByComparingTo("100");
    }
}
