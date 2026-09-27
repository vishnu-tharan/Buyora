package com.buyora.api.product.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record VariantAttributeRequest(
    @NotBlank String attributeSlug,
    @NotBlank String value,
    String displayValue,
    String colorCode
) {}
