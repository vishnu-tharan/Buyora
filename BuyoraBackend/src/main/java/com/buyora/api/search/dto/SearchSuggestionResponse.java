package com.buyora.api.search.dto;

import java.util.List;
import java.util.UUID;

public record SearchSuggestionResponse(
    List<ProductSuggestion> products,
    List<CategorySuggestion> categories,
    List<BrandSuggestion> brands
) {
    public record ProductSuggestion(UUID publicId, String name, String slug, String imageUrl) {}
    public record CategorySuggestion(UUID publicId, String name, String slug) {}
    public record BrandSuggestion(UUID publicId, String name, String slug) {}
}
