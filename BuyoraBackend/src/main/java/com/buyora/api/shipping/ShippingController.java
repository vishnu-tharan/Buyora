package com.buyora.api.shipping;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

  private final ShippingService shippingService;

  @GetMapping("/methods")
  public ResponseEntity<List<ShippingMethodDto>> getShippingMethods() {
    return ResponseEntity.ok(shippingService.getActiveShippingMethods());
  }
}
