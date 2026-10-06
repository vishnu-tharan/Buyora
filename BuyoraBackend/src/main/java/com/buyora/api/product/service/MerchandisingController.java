package com.buyora.api.product.service;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.inventory.repository.InventoryItemRepository;
import com.buyora.api.product.entity.*;
import com.buyora.api.product.repository.ProductRepository;
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
public class MerchandisingController {
  private final ProductRepository products;
  private final InventoryItemRepository inventory;
  private final CatalogService catalog;
  private final EntityManager em;
  private final JdbcTemplate jdbc;
  private final com.fasterxml.jackson.databind.ObjectMapper json;
  private final BuyoraProperties properties;

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
      boolean bestSeller,
      @Size(max = 4) List<@Positive Long> complementIds,
      @Size(max = 1000) String videoUrl) {}

  @PutMapping("/api/v1/admin/products/{id}/merchandising")
  @Transactional
  public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody Edit edit) {
    var product =
        products
            .findForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    Set<Long> keep = new HashSet<>();
    Set<String> skus = new HashSet<>();
    for (var input : edit.variants()) {
      if (!skus.add(input.sku())) throw new IllegalArgumentException("Each SKU must be unique");
      var variant =
          input.id() == null
              ? new ProductVariant()
              : product.getVariants().stream()
                  .filter(v -> v.getId().equals(input.id()))
                  .findFirst()
                  .orElseThrow(
                      () -> new IllegalArgumentException("Variant does not belong to product"));
      boolean fresh = variant.getId() == null;
      variant.setProduct(product);
      variant.setSku(input.sku());
      variant.setPrice(input.price());
      variant.setCompareAtPrice(input.compareAtPrice());
      variant.setActive(input.active());
      variant.getVariantAttributes().clear();
      if (!fresh) em.flush();
      if (input.attributes() != null)
        for (var a : input.attributes().entrySet()) {
          if (a.getKey().isBlank() || a.getValue().isBlank())
            throw new IllegalArgumentException("Attribute names and values are required");
          String slug = com.buyora.api.common.util.SlugUtil.toSlug(a.getKey());
          if (slug.isBlank()) throw new IllegalArgumentException("Invalid attribute name");
          var definitions =
              em.createQuery(
                      "select a from AttributeDefinition a where a.slug=:slug",
                      AttributeDefinition.class)
                  .setParameter("slug", slug)
                  .getResultList();
          AttributeDefinition definition;
          if (definitions.isEmpty()) {
            definition = new AttributeDefinition();
            definition.setName(a.getKey());
            definition.setSlug(slug);
            definition.setFilterable(true);
            em.persist(definition);
          } else definition = definitions.getFirst();
          variant
              .getVariantAttributes()
              .add(
                  VariantAttribute.builder()
                      .variant(variant)
                      .attributeDefinition(definition)
                      .value(a.getValue())
                      .build());
        }
      if (fresh) {
        product.getVariants().add(variant);
        em.persist(variant);
        em.flush();
        var stock = new com.buyora.api.inventory.entity.InventoryItem();
        stock.setVariant(variant);
        inventory.save(stock);
      }
      keep.add(variant.getId());
    }
    // Omitted variants are archived, never deleted: orders and reservations retain their identity.
    product.getVariants().stream()
        .filter(v -> !keep.contains(v.getId()))
        .forEach(v -> v.setActive(false));
    var existingImages =
        product.getImages().stream()
            .map(ProductImage::getUrl)
            .collect(java.util.stream.Collectors.toSet());
    product.getVariants().forEach(v -> v.getImages().clear());
    product.getImages().clear();
    em.flush();
    int order = 0;
    for (var input : edit.images()) {
      java.net.URI uri;
      try {
        uri = java.net.URI.create(input.url());
      } catch (RuntimeException e) {
        throw new IllegalArgumentException("Invalid image URL");
      }
      String prefix = properties.getApiUrl() + "/api/v1/media/";
      if (!existingImages.contains(input.url()) && !input.url().matches("/media/[0-9a-fA-F-]{36}"))
        throw new IllegalArgumentException("Upload images using the image uploader");
      if (input.url().startsWith("/media/")) {
        Integer available =
            jdbc.queryForObject(
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
            product.getVariants().stream()
                .filter(v -> v.getId().equals(input.variantId()))
                .findFirst()
                .orElseThrow(
                    () ->
                        new IllegalArgumentException("Image variant does not belong to product")));
      product.getImages().add(image);
      if (image.getVariant() != null) image.getVariant().getImages().add(image);
    }
    try {
      product.setSpecifications(
          edit.specifications() == null ? null : json.writeValueAsString(edit.specifications()));
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid specifications");
    }
    if (edit.videoUrl() != null
        && !edit.videoUrl().isBlank()
        && !edit.videoUrl().matches("/media/[0-9a-fA-F-]{36}"))
      throw new IllegalArgumentException("Upload the product video first");
    if (edit.videoUrl() != null && !edit.videoUrl().isBlank()) {
      Integer present =
          jdbc.queryForObject(
              "SELECT COUNT(*) FROM media_assets WHERE id=? AND public_asset AND"
                  + " content_type=\'video/mp4\'",
              Integer.class,
              java.util.UUID.fromString(edit.videoUrl().substring(7)));
      if (present == null || present != 1)
        throw new IllegalArgumentException("Video upload not found");
    }
    product.setVideoUrl(edit.videoUrl());
    product.setFeatured(edit.featured());
    product.setNewArrival(edit.newArrival());
    product.setBestSeller(edit.bestSeller());
    jdbc.update("DELETE FROM product_complements WHERE product_id=?", id);
    if (edit.complementIds() != null)
      for (Long other : new LinkedHashSet<>(edit.complementIds())) {
        if (other.equals(id) || !products.existsById(other))
          throw new IllegalArgumentException("Select another existing product as a complement");
        jdbc.update(
            "INSERT INTO product_complements(product_id,complement_id) VALUES (?,?)", id, other);
      }
    products.saveAndFlush(product);
    return catalog.adminResponse(product);
  }

  @GetMapping("/api/v1/products/{slug}/complements")
  @Transactional(readOnly = true)
  public List<Map<String, Object>> complements(@PathVariable String slug) {
    var product =
        products
            .findBySlug(slug)
            .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    return jdbc
        .queryForList(
            "SELECT complement_id FROM product_complements WHERE product_id=? ORDER BY"
                + " complement_id",
            product.getId())
        .stream()
        .map(r -> products.findById(((Number) r.get("complement_id")).longValue()).orElse(null))
        .filter(p -> p != null && p.getStatus() == ProductStatus.ACTIVE)
        .map(catalog::response)
        .toList();
  }

  @GetMapping("/api/v1/admin/products/{id}/complements")
  public List<Long> selected(@PathVariable Long id) {
    return jdbc.queryForList(
        "SELECT complement_id FROM product_complements WHERE product_id=?", Long.class, id);
  }
}
