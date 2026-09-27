package com.buyora.api.coupon.service;
import com.buyora.api.coupon.repository.CouponRepository;
import com.buyora.api.coupon.entity.Coupon;
import com.buyora.api.coupon.dto.CouponRequest;
import com.buyora.api.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import java.util.*;
@Service @RequiredArgsConstructor
public class AdminCouponService {
    private final CouponRepository coupons;
    @Transactional(readOnly = true) public Page<Map<String, Object>> list(Pageable pageable) { return coupons.findAll(pageable).map(this::response); }
    @Transactional public Map<String, Object> save(Long id, CouponRequest request) {
        if (request.endDate() != null && !request.endDate().isAfter(request.startDate())) throw new IllegalArgumentException("End date must follow start date");
        if (request.type().equals("PERCENTAGE") && request.value().compareTo(new java.math.BigDecimal("100")) > 0) throw new IllegalArgumentException("Percentage cannot exceed 100");
        var coupon = id == null ? new Coupon() : coupons.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setCode(request.code()); coupon.setType(request.type()); coupon.setValue(request.value()); coupon.setMinPurchaseAmount(request.minimumOrderAmount());
        coupon.setMaxDiscountAmount(request.maximumDiscountAmount()); coupon.setValidFrom(request.startDate()); coupon.setValidTo(request.endDate()); coupon.setUsageLimit(request.usageLimit()); coupon.setActive(request.isActive());
        return response(coupons.saveAndFlush(coupon));
    }
    @Transactional public void deactivate(Long id) { var coupon = coupons.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Coupon not found")); coupon.setActive(false); coupons.save(coupon); }
    private Map<String, Object> response(Coupon coupon) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", coupon.getId()); result.put("code", coupon.getCode()); result.put("type", coupon.getType()); result.put("value", coupon.getValue());
        result.put("minimumOrderAmount", coupon.getMinPurchaseAmount()); result.put("maximumDiscountAmount", coupon.getMaxDiscountAmount()); result.put("startDate", coupon.getValidFrom()); result.put("endDate", coupon.getValidTo()); result.put("usageLimit", coupon.getUsageLimit()); result.put("usedCount", coupon.getUsedCount()); result.put("isActive", coupon.getActive());
        return result;
    }
}
