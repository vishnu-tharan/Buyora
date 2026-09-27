package com.buyora.api.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CategoryRequest(
    @NotBlank @Size(max=200) String name,
    UUID parentPublicId,
    String description,
    String imageUrl,
    String imageAlt,
    Integer sortOrder,
    Boolean active,
    String seoTitle,
    String seoDescription
) {}
