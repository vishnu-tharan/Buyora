package com.buyora.api.product;

import jakarta.validation.constraints.NotBlank;

public record VariantAttributeRequest(
    @NotBlank String attributeSlug,
    @NotBlank String value,
    String displayValue,
    String colorCode) {}
