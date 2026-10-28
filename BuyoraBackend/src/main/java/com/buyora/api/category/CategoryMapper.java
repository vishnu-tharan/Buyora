package com.buyora.api.category;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
  public CategoryResponse toResponse(Category category) {
    if (category == null) return null;
    List<CategoryResponse> children = null;
    if (category.getChildren() != null) {
      children = new ArrayList<>();
      for (Category child : category.getChildren()) children.add(toResponse(child));
    }
    return new CategoryResponse(
        category.getId(),
        category.getPublicId(),
        category.getName(),
        category.getSlug(),
        category.getDescription(),
        category.getImageUrl(),
        category.getImageAlt(),
        category.getParent() == null ? null : category.getParent().getPublicId(),
        category.getLevel(),
        category.getSortOrder(),
        category.isActive(),
        category.getSeoTitle(),
        category.getSeoDescription(),
        children);
  }
}
