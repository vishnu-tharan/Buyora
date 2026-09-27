package com.buyora.api.coupon.controller;
import com.buyora.api.coupon.service.AdminCouponService;
import com.buyora.api.coupon.dto.CouponRequest;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.Map;
@RestController @RequestMapping("/api/v1/admin/coupons") @RequiredArgsConstructor
public class AdminCouponController {
    private final AdminCouponService coupons;
    @GetMapping public Page<Map<String, Object>> list(Pageable pageable) { return coupons.list(pageable); }
    @PostMapping public Map<String, Object> create(@Valid @RequestBody CouponRequest request) { return coupons.save(null, request); }
    @PutMapping("/{id}") public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody CouponRequest request) { return coupons.save(id, request); }
    @DeleteMapping("/{id}") public void deactivate(@PathVariable Long id) { coupons.deactivate(id); }
}
