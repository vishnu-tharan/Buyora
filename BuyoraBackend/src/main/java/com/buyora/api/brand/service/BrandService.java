package com.buyora.api.brand.service;

import com.buyora.api.brand.dto.BrandRequest;
import com.buyora.api.brand.dto.BrandResponse;
import com.buyora.api.brand.entity.Brand;
import com.buyora.api.brand.mapper.BrandMapper;
import com.buyora.api.brand.repository.BrandRepository;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.common.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Cacheable("brands")
    @Transactional(readOnly = true)
    public Page<BrandResponse> getAllActiveBrands(Pageable pageable) {
        return brandRepository.findAllByActiveTrueOrderBySortOrderAsc(pageable)
            .map(brandMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandBySlug(String slug) {
        return brandRepository.findBySlug(slug)
            .filter(item -> item.isActive())
            .map(brandMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
    }

    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        Brand brand = new Brand();
        brand.setName(request.name());
        brand.setSlug(generateUniqueSlug(request.name()));
        brand.setDescription(request.description());
        brand.setLogoUrl(request.logoUrl());
        brand.setLogoAlt(request.logoAlt());
        brand.setWebsiteUrl(request.websiteUrl());
        brand.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        brand.setActive(request.active() != null ? request.active() : true);
        return brandMapper.toResponse(brandRepository.save(brand));
    }
    
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BrandResponse> getAll(org.springframework.data.domain.Pageable pageable) {
        return brandRepository.findAll(pageable).map(brandMapper::toResponse);
    }
    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtil.toSlug(name);
        String slug = baseSlug;
        int count = 1;
        while (brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }
}
