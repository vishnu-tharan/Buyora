package com.buyora.api.brand.mapper;

import com.buyora.api.brand.dto.BrandResponse;
import com.buyora.api.brand.entity.Brand;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    BrandResponse toResponse(Brand brand);
}
