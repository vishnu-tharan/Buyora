package com.buyora.api.product;

import com.buyora.api.brand.BrandMapper;
import com.buyora.api.category.CategoryMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {
  private final CategoryMapper categories;
  private final BrandMapper brands;

  public ProductImageResponse image(ProductImage image) {
    if (image == null) return null;
    return new ProductImageResponse(
        image.getId(), image.getUrl(), image.getAltText(), image.getSortOrder(), image.isPrimary());
  }

  public AdminProductResponse toAdminResponse(Product product) {
    if (product == null) return null;
    List<ProductImageResponse> images = null;
    if (product.getImages() != null) {
      images = new ArrayList<>();
      for (ProductImage productImage : product.getImages()) images.add(image(productImage));
    }
    List<AdminVariantResponse> variants = null;
    if (product.getVariants() != null) {
      variants = new ArrayList<>();
      for (ProductVariant variant : product.getVariants()) variants.add(toVariantResponse(variant));
    }
    return new AdminProductResponse(
        product.getId(),
        product.getPublicId(),
        product.getName(),
        product.getSlug(),
        product.getShortDescription(),
        product.getDescription(),
        categories.toResponse(product.getCategory()),
        brands.toResponse(product.getBrand()),
        product.getStatus(),
        product.isFeatured(),
        product.isNewArrival(),
        product.isBestSeller(),
        product.getTags() == null ? null : new ArrayList<>(product.getTags()),
        product.getSeoTitle(),
        product.getSeoDescription(),
        product.getAverageRating(),
        product.getReviewCount(),
        product.getSpecifications(),
        product.getShippingInfo(),
        product.getReturnInfo(),
        images,
        variants);
  }

  private AdminVariantResponse toVariantResponse(ProductVariant variant) {
    if (variant == null) return null;
    return new AdminVariantResponse(
        variant.getPublicId(),
        variant.getSku(),
        variant.getPrice(),
        variant.getCompareAtPrice(),
        variant.getCostPrice(),
        variant.getWeightGrams(),
        variant.isActive(),
        variant.getSortOrder());
  }
}
