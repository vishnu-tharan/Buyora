package com.buyora.api.category.mapper;

import com.buyora.api.category.dto.CategoryResponse;
import com.buyora.api.category.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "parentPublicId", source = "parent.publicId")
    CategoryResponse toResponse(Category category);
}
