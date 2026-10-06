package com.buyora.api.store;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.shipping.repository.ShippingMethodRepository;
import jakarta.validation.constraints.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
@Validated
public class StoreController {
  private final BuyoraProperties properties;
  private final ShippingMethodRepository shipping;
  private final StoreSettings settings;

  @GetMapping("/info")
  public Map<String, Object> info() {
    var s = settings.get();
    return Map.of(
        "businessName",
        s.businessName(),
        "businessAddress",
        s.businessAddress(),
        "supportEmail",
        s.supportEmail(),
        "whatsappNumber",
        s.whatsappNumber(),
        "supportHours",
        s.supportHours(),
        "returnWindowDays",
        s.returnWindowDays(),
        "freeReturnShipping",
        s.freeReturnShipping());
  }

  @GetMapping("/delivery")
  public Map<String, Object> delivery(@RequestParam @Size(max = 100) String district) {
    if (!Districts.ALL.contains(district))
      throw new IllegalArgumentException("Select a valid Sri Lankan district");
    var s = settings.get();
    int extra = Math.max(0, s.districtExtraDays().getOrDefault(district, 0));
    var methods =
        shipping.findByActiveTrueOrderBySortOrderAsc().stream()
            .map(
                m ->
                    Map.of(
                        "id",
                        m.getId().toString(),
                        "name",
                        m.getName(),
                        "price",
                        m.getBaseRate(),
                        "description",
                        m.getDescription() == null ? "" : m.getDescription()))
            .toList();
    return Map.of(
        "district",
        district,
        "minDays",
        Math.max(1, s.deliveryMinDays()) + extra,
        "maxDays",
        Math.max(s.deliveryMinDays(), s.deliveryMaxDays()) + extra,
        "codAvailable",
        properties.getPayment().getCod().isEnabled()
            && (s.codDistricts().isEmpty() || s.codDistricts().contains(district)),
        "methods",
        methods);
  }
}
