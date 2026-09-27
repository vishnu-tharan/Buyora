package com.buyora.api.category.dto;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
    Long id,
    UUID publicId,
    String name,
    String slug,
    String description,
    String imageUrl,
    String imageAlt,
    UUID parentPublicId,
    int level,
    int sortOrder,
    boolean active,
    String seoTitle,
    String seoDescription,
    List<CategoryResponse> children
) implements java.io.Serializable {}
