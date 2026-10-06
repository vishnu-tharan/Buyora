package com.buyora.api.store;

import com.buyora.api.common.config.BuyoraProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

@Service
@RequiredArgsConstructor
public class StoreSettings {
  private final JdbcTemplate jdbc;
  private final ObjectMapper json;
  private final BuyoraProperties properties;

  public record Settings(
      @NotBlank @Size(max = 200) String businessName,
      @NotNull @Size(max = 500) String businessAddress,
      @NotNull @Email @Size(max = 255) String supportEmail,
      @NotNull @Pattern(regexp = "^$|\\+?[0-9]{7,15}") String whatsappNumber,
      @NotNull @Size(max = 200) String supportHours,
      @Min(1) @Max(90) int returnWindowDays,
      boolean freeReturnShipping,
      @Min(1) @Max(30) int deliveryMinDays,
      @Min(1) @Max(60) int deliveryMaxDays,
      @NotNull @Size(max = 25) List<String> codDistricts,
      @NotNull @Size(max = 25) Map<String, @Min(0) @Max(30) Integer> districtExtraDays) {}

  public Settings get() {
    var rows = jdbc.queryForList("SELECT value::text FROM store_settings WHERE id=1", String.class);
    if (!rows.isEmpty()) {
      try {
        return json.readValue(rows.getFirst(), Settings.class);
      } catch (Exception e) {
        throw new IllegalStateException("Store settings require repair");
      }
    }
    var s = properties.getStore();
    return new Settings(
        s.getBusinessName(),
        s.getBusinessAddress(),
        s.getSupportEmail(),
        s.getWhatsappNumber(),
        s.getSupportHours(),
        properties.getReturns().getWindowDays(),
        s.isFreeReturnShipping(),
        s.getDeliveryMinDays(),
        s.getDeliveryMaxDays(),
        s.getCodDistricts(),
        s.getDistrictExtraDays());
  }

  public void save(Settings s) {
    if (s.deliveryMaxDays() < s.deliveryMinDays()
        || !Districts.ALL.containsAll(s.codDistricts())
        || !Districts.ALL.containsAll(s.districtExtraDays().keySet()))
      throw new com.buyora.api.common.exception.BusinessException(
          "INVALID_DELIVERY", "Check the delivery range and districts");
    try {
      jdbc.update(
          "INSERT INTO store_settings(id,value) VALUES (1,CAST(? AS jsonb)) ON CONFLICT(id) DO"
              + " UPDATE SET value=EXCLUDED.value",
          json.writeValueAsString(s));
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new IllegalArgumentException("Invalid settings");
    }
  }

  @RestController
  @RequiredArgsConstructor
  public static class Admin {
    private final StoreSettings settings;

    @GetMapping("/api/v1/admin/store-settings")
    public Settings get() {
      return settings.get();
    }

    @PutMapping("/api/v1/admin/store-settings")
    public Settings save(@Valid @RequestBody Settings input) {
      settings.save(input);
      return settings.get();
    }
  }
}
