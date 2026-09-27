package com.buyora.api.shipping.controller;

import com.buyora.api.shipping.dto.ShippingMethodDto;
import com.buyora.api.shipping.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

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
