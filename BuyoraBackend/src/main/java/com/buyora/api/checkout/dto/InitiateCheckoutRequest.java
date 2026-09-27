package com.buyora.api.checkout.dto;

import com.buyora.api.address.dto.AddressRequest;
import java.util.UUID;

public record InitiateCheckoutRequest(
    UUID shippingAddressId,
    @jakarta.validation.Valid AddressRequest guestShippingAddress,
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "PAYHERE|CASH_ON_DELIVERY") String paymentMethod,
    @jakarta.validation.constraints.NotBlank String deliveryMethod,
    @jakarta.validation.constraints.Size(max = 1000) String customerNotes,
    @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String guestEmail,
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "[0-9a-fA-F-]{36}") String idempotencyKey
) {}
