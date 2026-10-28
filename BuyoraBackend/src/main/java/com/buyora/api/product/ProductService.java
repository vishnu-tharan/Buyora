package com.buyora.api.product;

import com.buyora.api.brand.BrandRepository;
import com.buyora.api.category.CategoryRepository;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.common.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final BrandRepository brandRepository;
  private final ProductMapper productMapper;
  private final com.buyora.api.inventory.InventoryItemRepository inventory;
  private final CatalogService catalog;

  @Transactional
  public AdminProductResponse createProduct(CreateProductRequest request) {
    Product product = new Product();
    product.setName(request.name());
    product.setSlug(generateUniqueSlug(request.name()));
    product.setShortDescription(request.shortDescription());
    product.setDescription(request.description());
    product.setTags(
        request.tags() == null
            ? new java.util.ArrayList<>()
            : new java.util.ArrayList<>(request.tags()));

    product.setCategory(
        categoryRepository
            .findByPublicId(request.categoryPublicId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found")));

    if (request.brandPublicId() != null) {
      product.setBrand(
          brandRepository
              .findByPublicId(request.brandPublicId())
              .orElseThrow(() -> new ResourceNotFoundException("Brand not found")));
    }

    if (request.status() != null) {
      product.setStatus(ProductStatus.valueOf(request.status()));
    }

    product.setFeatured(request.featured() != null && request.featured());
    product.setNewArrival(request.newArrival() != null && request.newArrival());
    product.setBestSeller(request.bestSeller() != null && request.bestSeller());

    product.setAverageRating(java.math.BigDecimal.ZERO);
    for (var input : request.variants()) {
      if (input.attributes() != null && !input.attributes().isEmpty())
        throw new IllegalArgumentException(
            "Create attribute definitions before adding variant attributes");
      var variant =
          com.buyora.api.product.ProductVariant.builder()
              .product(product)
              .sku(input.sku())
              .price(input.price())
              .compareAtPrice(input.compareAtPrice())
              .costPrice(input.costPrice())
              .weightGrams(input.weightGrams())
              .active(input.active() == null || input.active())
              .sortOrder(input.sortOrder() == null ? 0 : input.sortOrder())
              .build();
      product.getVariants().add(variant);
    }
    Product saved = productRepository.saveAndFlush(product);
    for (var variant : saved.getVariants()) {
      var stock = new com.buyora.api.inventory.InventoryItem();
      stock.setVariant(variant);
      inventory.save(stock);
    }
    return productMapper.toAdminResponse(saved);
  }

  @Transactional(readOnly = true)
  public org.springframework.data.domain.Page<java.util.Map<String, Object>> list(
      org.springframework.data.domain.Pageable pageable) {
    return productRepository.findAll(pageable).map(catalog::adminResponse);
  }

  @Transactional(readOnly = true)
  public java.util.Map<String, Object> detail(Long id) {
    return catalog.adminResponse(
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
  }

  @Transactional
  public java.util.Map<String, Object> update(
      Long id, com.buyora.api.product.UpdateProductRequest request) {
    var product =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    product.setName(request.name());
    product.setShortDescription(request.shortDescription());
    product.setDescription(request.description());
    product.setStatus(com.buyora.api.product.ProductStatus.valueOf(request.status()));
    product.setCategory(
        categoryRepository
            .findByPublicId(request.categoryPublicId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
    productRepository.saveAndFlush(product);
    return catalog.adminResponse(product);
  }

  private String generateUniqueSlug(String name) {
    String baseSlug = SlugUtil.toSlug(name);
    String slug = baseSlug;
    int count = 1;
    while (productRepository.existsBySlug(slug)) {
      slug = baseSlug + "-" + count++;
    }
    return slug;
  }
}
