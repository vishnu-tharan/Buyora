package com.buyora.api.address.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
    @Size(max = 50) String label,
    @NotBlank @Size(max = 100) String firstName,
    @NotBlank @Size(max = 100) String lastName,
    @NotBlank @Size(max = 30) String phone,
    @NotBlank @Size(max = 300) String addressLine1,
    @Size(max = 300) String addressLine2,
    @NotBlank @Size(max = 100) String city,
    @Size(max = 100) String district,
    @Size(max = 100) String stateProvince,
    @Size(max = 20) String postalCode,
    @NotBlank @Size(max = 100) String country,
    @Size(max = 2) String countryCode,
    boolean isDefaultShipping,
    boolean isDefaultBilling
) {}
