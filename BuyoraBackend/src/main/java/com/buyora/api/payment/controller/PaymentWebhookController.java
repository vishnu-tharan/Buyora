package com.buyora.api.payment.controller;

import com.buyora.api.payment.webhook.PayhereWebhookHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments/webhooks")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PayhereWebhookHandler payhereWebhookHandler;

    @PostMapping(value = "/payhere", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> handlePayhereWebhook(@RequestParam Map<String, String> formData) {
        payhereWebhookHandler.handle(formData);
        return ResponseEntity.ok().build();
    }
}
