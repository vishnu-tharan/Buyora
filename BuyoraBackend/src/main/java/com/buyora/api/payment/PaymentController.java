package com.buyora.api.payment;

import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;
  private final com.buyora.api.common.security.CurrentUser currentUser;

  @PostMapping("/initiate")
  public ResponseEntity<PaymentInitiationResponse> initiatePayment(
      @Valid @RequestBody InitiatePaymentRequest request,
      @CookieValue(name = "buyora_guest_cart", required = false) String guestId,
      @AuthenticationPrincipal
          org.springframework.security.core.userdetails.UserDetails userDetails) {

    Long userId = currentUser.optionalId();

    return ResponseEntity.ok(paymentService.initiatePayment(request, userId, guestId));
  }

  @GetMapping("/{paymentId}/status")
  public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
      @PathVariable UUID paymentId,
      @CookieValue(name = "buyora_guest_cart", required = false) String guestId) {
    return ResponseEntity.ok(
        paymentService.getStatus(paymentId, currentUser.optionalId(), guestId));
  }
}
