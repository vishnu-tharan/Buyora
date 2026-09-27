package com.buyora.api.product.mapper;

import com.buyora.api.brand.mapper.BrandMapper;
import com.buyora.api.category.mapper.CategoryMapper;
import com.buyora.api.product.dto.ProductSummaryResponse;
import com.buyora.api.product.dto.admin.AdminProductResponse;
import com.buyora.api.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, BrandMapper.class})
public interface ProductMapper {
    @Mapping(target = "basePrice", ignore = true)
    @Mapping(target = "salePriceFrom", ignore = true)
    @Mapping(target = "discountPercentage", ignore = true)
    @Mapping(target = "inStock", ignore = true)
    @Mapping(target = "primaryImage", ignore = true)
    ProductSummaryResponse toSummaryResponse(Product product);
    
    @Mapping(target = "isPrimary", expression = "java(image.isPrimary())")
    com.buyora.api.product.dto.ProductImageResponse image(com.buyora.api.product.entity.ProductImage image);

    AdminProductResponse toAdminResponse(Product product);
}
