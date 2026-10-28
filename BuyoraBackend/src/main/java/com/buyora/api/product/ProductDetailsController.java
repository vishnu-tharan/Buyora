package com.buyora.api.product;

import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.common.util.SlugUtil;
import com.buyora.api.inventory.InventoryItem;
import com.buyora.api.inventory.InventoryItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ProductDetailsController {
  private final ProductRepository productRepository;
  private final InventoryItemRepository inventoryRepository;
  private final CatalogService catalogService;
  private final EntityManager entityManager;
  private final JdbcTemplate database;
  private final ObjectMapper objectMapper;

  public record Variant(
      Long id,
      @NotBlank @Size(max = 100) String sku,
      @NotNull @DecimalMin("0") BigDecimal price,
      @DecimalMin("0") BigDecimal compareAtPrice,
      boolean active,
      @Size(max = 12) Map<@Size(max = 50) String, @Size(max = 100) String> attributes) {}

  public record ImageInput(
      @NotBlank @Size(max = 1000) String url, @Size(max = 255) String altText, Long variantId) {}

  public record Edit(
      @NotEmpty @Size(max = 50) List<@Valid Variant> variants,
      @NotNull @Size(max = 20) List<@Valid ImageInput> images,
      @Size(max = 50) Map<@Size(max = 100) String, @Size(max = 1000) String> specifications,
      boolean featured,
      boolean newArrival,
      boolean bestSeller) {}

  @PutMapping("/api/v1/admin/products/{id}/details")
  @Transactional
  public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody Edit edit) {
    var product =
        productRepository
            .findForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    updateVariants(product, edit.variants());
    replaceImages(product, edit.images());

    try {
      product.setSpecifications(
          edit.specifications() == null
              ? null
              : objectMapper.writeValueAsString(edit.specifications()));
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid specifications");
    }
    product.setFeatured(edit.featured());
    product.setNewArrival(edit.newArrival());
    product.setBestSeller(edit.bestSeller());
    productRepository.saveAndFlush(product);
    return catalogService.adminResponse(product);
  }

  private void updateVariants(Product product, List<Variant> inputs) {
    Set<Long> retainedVariantIds = new HashSet<>();
    Set<String> submittedSkus = new HashSet<>();
    for (var input : inputs) {
      if (!submittedSkus.add(input.sku()))
        throw new IllegalArgumentException("Each SKU must be unique");
      var variant =
          input.id() == null
              ? new ProductVariant()
              : findProductVariant(product, input.id(), "Variant does not belong to product");
      boolean isNewVariant = variant.getId() == null;
      variant.setProduct(product);
      variant.setSku(input.sku());
      variant.setPrice(input.price());
      variant.setCompareAtPrice(input.compareAtPrice());
      variant.setActive(input.active());
      variant.getVariantAttributes().clear();
      if (!isNewVariant) entityManager.flush();
      if (input.attributes() != null)
        for (var attribute : input.attributes().entrySet()) {
          if (attribute.getKey().isBlank() || attribute.getValue().isBlank())
            throw new IllegalArgumentException("Attribute names and values are required");
          String slug = SlugUtil.toSlug(attribute.getKey());
          if (slug.isBlank()) throw new IllegalArgumentException("Invalid attribute name");
          var attributeDefinitions =
              entityManager
                  .createQuery(
                      "select a from AttributeDefinition a where a.slug=:slug",
                      AttributeDefinition.class)
                  .setParameter("slug", slug)
                  .getResultList();
          AttributeDefinition definition;
          if (attributeDefinitions.isEmpty()) {
            definition = new AttributeDefinition();
            definition.setName(attribute.getKey());
            definition.setSlug(slug);
            definition.setFilterable(true);
            entityManager.persist(definition);
          } else definition = attributeDefinitions.getFirst();
          variant
              .getVariantAttributes()
              .add(
                  VariantAttribute.builder()
                      .variant(variant)
                      .attributeDefinition(definition)
                      .value(attribute.getValue())
                      .build());
        }
      if (isNewVariant) {
        product.getVariants().add(variant);
        entityManager.persist(variant);
        entityManager.flush();
        var inventoryItem = new InventoryItem();
        inventoryItem.setVariant(variant);
        inventoryRepository.save(inventoryItem);
      }
      retainedVariantIds.add(variant.getId());
    }
    // Omitted variants are archived, never deleted: orders and reservations retain their identity.
    for (ProductVariant variant : product.getVariants()) {
      if (!retainedVariantIds.contains(variant.getId())) {
        variant.setActive(false);
      }
    }
  }

  private void replaceImages(Product product, List<ImageInput> inputs) {
    var existingImages =
        product.getImages().stream()
            .map(ProductImage::getUrl)
            .collect(java.util.stream.Collectors.toSet());
    product.getVariants().forEach(v -> v.getImages().clear());
    product.getImages().clear();
    entityManager.flush();
    int order = 0;
    for (var input : inputs) {
      java.net.URI uri;
      try {
        uri = java.net.URI.create(input.url());
      } catch (RuntimeException e) {
        throw new IllegalArgumentException("Invalid image URL");
      }
      if (!existingImages.contains(input.url()) && !input.url().matches("/media/[0-9a-fA-F-]{36}"))
        throw new IllegalArgumentException("Upload images using the image uploader");
      if (input.url().startsWith("/media/")) {
        Integer available =
            database.queryForObject(
                "SELECT COUNT(*) FROM media_assets WHERE id=? AND public_asset AND content_type"
                    + " LIKE \'image/%\'",
                Integer.class, java.util.UUID.fromString(input.url().substring(7)));
        if (available == null || available != 1)
          throw new IllegalArgumentException("Image upload not found");
      }
      if (input.url().startsWith("//") || input.url().contains("\\") || uri.getFragment() != null)
        throw new IllegalArgumentException("Invalid image URL");
      var image = new ProductImage();
      image.setProduct(product);
      image.setUrl(input.url());
      image.setAltText(input.altText());
      image.setSortOrder(order);
      image.setPrimary(order++ == 0);
      if (input.variantId() != null)
        image.setVariant(
            findProductVariant(
                product, input.variantId(), "Image variant does not belong to product"));
      product.getImages().add(image);
      if (image.getVariant() != null) image.getVariant().getImages().add(image);
    }
  }

  private ProductVariant findProductVariant(Product product, Long variantId, String errorMessage) {
    for (ProductVariant variant : product.getVariants()) {
      if (variant.getId().equals(variantId)) {
        return variant;
      }
    }
    throw new IllegalArgumentException(errorMessage);
  }
}
