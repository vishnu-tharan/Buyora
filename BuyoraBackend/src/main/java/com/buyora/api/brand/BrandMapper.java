package com.buyora.api.brand;

import org.springframework.stereotype.Component;

@Component
public class BrandMapper {
  public BrandResponse toResponse(Brand brand) {
    if (brand == null) return null;
    return new BrandResponse(
        brand.getId(),
        brand.getPublicId(),
        brand.getName(),
        brand.getSlug(),
        brand.getDescription(),
        brand.getLogoUrl(),
        brand.getLogoAlt(),
        brand.getWebsiteUrl(),
        brand.isActive(),
        brand.getSortOrder());
  }
}
