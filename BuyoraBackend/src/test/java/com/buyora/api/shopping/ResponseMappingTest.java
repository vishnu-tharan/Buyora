package com.buyora.api.shopping;

import static org.assertj.core.api.Assertions.assertThat;

import com.buyora.api.address.Address;
import com.buyora.api.address.AddressMapper;
import com.buyora.api.brand.BrandMapper;
import com.buyora.api.category.Category;
import com.buyora.api.category.CategoryMapper;
import com.buyora.api.product.Product;
import com.buyora.api.product.ProductImage;
import com.buyora.api.product.ProductMapper;
import com.buyora.api.product.ProductVariant;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ResponseMappingTest {
  @Test
  void addressKeepsRecipientNameAndDeliveryDefaults() {
    Address address = new Address();
    address.setPublicId(UUID.randomUUID());
    address.setRecipientName("Demo Customer Name");
    address.setAddressLine1("12 Main Road");
    address.setCity("Colombo");
    address.setDefaultShipping(true);

    var response = new AddressMapper().toResponse(address);

    assertThat(response.firstName()).isEqualTo("Demo");
    assertThat(response.lastName()).isEqualTo("Customer Name");
    assertThat(response.addressLine1()).isEqualTo("12 Main Road");
    assertThat(response.isDefaultShipping()).isTrue();
    address.setRecipientName("Customer");
    assertThat(new AddressMapper().toResponse(address).lastName()).isEmpty();
  }

  @Test
  void categoryTreeIncludesChildrenWithoutRecursingThroughParents() {
    Category parent = new Category();
    parent.setPublicId(UUID.randomUUID());
    Category child = new Category();
    child.setName("Headphones");
    child.setParent(parent);
    parent.setChildren(List.of(child));

    var response = new CategoryMapper().toResponse(parent);

    assertThat(response.parentPublicId()).isNull();
    assertThat(response.children()).hasSize(1);
    assertThat(response.children().getFirst().parentPublicId()).isEqualTo(parent.getPublicId());
    assertThat(response.children().getFirst().name()).isEqualTo("Headphones");
  }

  @Test
  void unbrandedProductKeepsVariantPricesAndPrimaryImage() {
    Product product = new Product();
    product.setName("Notebook");
    ProductVariant variant = new ProductVariant();
    variant.setSku("NOTEBOOK-01");
    variant.setPrice(new BigDecimal("200.00"));
    variant.setActive(true);
    product.setVariants(List.of(variant));
    ProductImage image = new ProductImage();
    image.setUrl("/products/notebook.jpg");
    image.setPrimary(true);
    product.setImages(List.of(image));

    var response =
        new ProductMapper(new CategoryMapper(), new BrandMapper()).toAdminResponse(product);

    assertThat(response.brand()).isNull();
    assertThat(response.variants().getFirst().sku()).isEqualTo("NOTEBOOK-01");
    assertThat(response.variants().getFirst().price()).isEqualByComparingTo("200.00");
    assertThat(response.images().getFirst().isPrimary()).isTrue();
  }
}
