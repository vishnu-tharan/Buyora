package com.buyora.api.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
    @NotBlank @Size(max=200) String name,
    String description,
    String logoUrl,
    String logoAlt,
    String websiteUrl,
    Boolean active,
    Integer sortOrder
) {}
