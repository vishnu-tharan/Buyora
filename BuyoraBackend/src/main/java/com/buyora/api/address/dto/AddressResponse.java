package com.buyora.api.address.dto;

import java.util.UUID;

public record AddressResponse(
    Long id,
    String publicId,
    String label,
    String firstName,
    String lastName,
    String phone,
    String addressLine1,
    String addressLine2,
    String city,
    String district,
    String stateProvince,
    String postalCode,
    String country,
    String countryCode,
    boolean isDefaultShipping,
    boolean isDefaultBilling
) {}
