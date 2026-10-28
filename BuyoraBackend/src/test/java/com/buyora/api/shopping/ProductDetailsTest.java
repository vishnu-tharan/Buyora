package com.buyora.api.shopping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.buyora.api.inventory.InventoryItemRepository;
import com.buyora.api.product.CatalogService;
import com.buyora.api.product.Product;
import com.buyora.api.product.ProductDetailsController;
import com.buyora.api.product.ProductImage;
import com.buyora.api.product.ProductRepository;
import com.buyora.api.product.ProductVariant;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class ProductDetailsTest {
  private final ProductRepository products = mock(ProductRepository.class);
  private final ProductDetailsController controller =
      new ProductDetailsController(
          products,
          mock(InventoryItemRepository.class),
          mock(CatalogService.class),
          mock(EntityManager.class),
          mock(JdbcTemplate.class),
          new ObjectMapper());

  @Test
  void archivesOmittedVariantsWithoutDeletingTheirRecords() {
    Product product = existingProduct();
    ProductVariant omittedVariant = variant(2L, "SECOND");
    product.getVariants().add(omittedVariant);

    controller.update(1L, request(List.of(input(1L)), List.of()));

    assertThat(product.getVariants()).hasSize(2);
    assertThat(omittedVariant.isActive()).isFalse();
    assertThat(product.getVariants().getFirst().isActive()).isTrue();
    verify(products).saveAndFlush(product);
  }

  @Test
  void rejectsVariantsFromAnotherProduct() {
    existingProduct();

    assertThatThrownBy(() -> controller.update(1L, request(List.of(input(99L)), List.of())))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Variant does not belong to product");
    verify(products, never()).saveAndFlush(any());
  }

  @Test
  void rejectsNewImagesThatWereNotUploaded() {
    existingProduct();
    var externalImage =
        new ProductDetailsController.ImageInput("https://example.com/photo.jpg", "Photo", null);

    assertThatThrownBy(
            () -> controller.update(1L, request(List.of(input(1L)), List.of(externalImage))))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Upload images using the image uploader");
    verify(products, never()).saveAndFlush(any());
  }

  @Test
  void rejectsImageAssignmentsToAnotherProductsVariant() {
    Product product = existingProduct();
    ProductImage savedImage = new ProductImage();
    savedImage.setUrl("/products/headphones.jpg");
    product.getImages().add(savedImage);
    var imageInput = new ProductDetailsController.ImageInput(savedImage.getUrl(), "Photo", 99L);

    assertThatThrownBy(
            () -> controller.update(1L, request(List.of(input(1L)), List.of(imageInput))))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Image variant does not belong to product");
    verify(products, never()).saveAndFlush(any());
  }

  private Product existingProduct() {
    Product product = new Product();
    product.getVariants().add(variant(1L, "FIRST"));
    when(products.findForUpdate(1L)).thenReturn(Optional.of(product));
    return product;
  }

  private ProductVariant variant(Long id, String sku) {
    ProductVariant variant = new ProductVariant();
    variant.setId(id);
    variant.setSku(sku);
    variant.setActive(true);
    return variant;
  }

  private ProductDetailsController.Variant input(Long id) {
    return new ProductDetailsController.Variant(
        id, "FIRST", new BigDecimal("200.00"), null, true, Map.of());
  }

  private ProductDetailsController.Edit request(
      List<ProductDetailsController.Variant> variants,
      List<ProductDetailsController.ImageInput> images) {
    return new ProductDetailsController.Edit(variants, images, Map.of(), false, false, false);
  }
}
