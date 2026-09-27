package com.buyora.api.address.controller;

import com.buyora.api.address.dto.AddressRequest;
import com.buyora.api.address.dto.AddressResponse;
import com.buyora.api.address.service.AddressService;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/account/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(addressService.getAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createAddress(user.getId(), request));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID publicId,
            @Valid @RequestBody AddressRequest request) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(addressService.updateAddress(user.getId(), publicId, request));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID publicId) {
        User user = userService.findByEmail(userDetails.getUsername());
        addressService.deleteAddress(user.getId(), publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/default")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID publicId) {
        User user = userService.findByEmail(userDetails.getUsername());
        addressService.setDefaultBilling(user.getId(), publicId);
        return ResponseEntity.ok(addressService.setDefaultShipping(user.getId(), publicId));
    }

}
