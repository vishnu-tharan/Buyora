package com.buyora.api.brand;

import java.util.UUID;

public record BrandResponse(
    Long id,
    UUID publicId,
    String name,
    String slug,
    String description,
    String logoUrl,
    String logoAlt,
    String websiteUrl,
    boolean active,
    int sortOrder) {}
