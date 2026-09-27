package com.buyora.api.category.service;

import com.buyora.api.category.dto.CategoryRequest;
import com.buyora.api.category.dto.CategoryResponse;
import com.buyora.api.category.entity.Category;
import com.buyora.api.category.mapper.CategoryMapper;
import com.buyora.api.category.repository.CategoryRepository;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.common.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Cacheable("categories")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllActiveOrderedByLevelAndSort()
            .stream().map(categoryMapper::toResponse).toList();
    }

    @Cacheable(value = "categories", key = "'tree'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        return categoryRepository.findAllByParentIsNullAndActiveTrueOrderBySortOrderAsc()
            .stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
            .filter(item -> item.isActive())
            .map(categoryMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setSlug(generateUniqueSlug(request.name()));
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        category.setImageAlt(request.imageAlt());
        category.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        category.setActive(request.active() != null ? request.active() : true);
        category.setSeoTitle(request.seoTitle());
        category.setSeoDescription(request.seoDescription());

        if (request.parentPublicId() != null) {
            Category parent = categoryRepository.findByPublicId(request.parentPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
            category.setPath(parent.getPath() + parent.getId() + "/");
        } else {
            category.setLevel(0);
            category.setPath("/");
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }
    
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CategoryResponse> getAll(org.springframework.data.domain.Pageable pageable) {
        return categoryRepository.findAll(pageable).map(categoryMapper::toResponse);
    }
    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtil.toSlug(name);
        String slug = baseSlug;
        int count = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }
}
