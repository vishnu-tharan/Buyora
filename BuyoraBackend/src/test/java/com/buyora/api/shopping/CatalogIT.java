package com.buyora.api.shopping;

import static org.assertj.core.api.Assertions.*;

import com.buyora.api.brand.BrandResponse;
import com.buyora.api.brand.BrandService;
import com.buyora.api.category.CategoryResponse;
import com.buyora.api.category.CategoryService;
import com.buyora.api.common.AbstractIntegrationTest;
import com.buyora.api.product.FacetController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;

class CatalogIT extends AbstractIntegrationTest {
  @Autowired JdbcTemplate jdbc;
  @Autowired FacetController facets;
  @Autowired BrandService brands;
  @Autowired CategoryService categories;

  @Test
  void brandListingsReflectDatabaseUpdates() {
    var page = PageRequest.of(0, 20);
    brands.getAllActiveBrands(page);
    jdbc.update("INSERT INTO brands(name,slug) VALUES (?,?)", "Catalog brand", "catalog-brand");
    assertThat(brands.getAllActiveBrands(page).getContent())
        .extracting(BrandResponse::name)
        .contains("Catalog brand");

    jdbc.update("UPDATE brands SET name=? WHERE slug=?", "Updated brand", "catalog-brand");
    assertThat(brands.getAllActiveBrands(page).getContent())
        .extracting(BrandResponse::name)
        .contains("Updated brand")
        .doesNotContain("Catalog brand");
  }

  @Test
  void categoryTreeReflectsDatabaseUpdates() {
    categories.getCategoryTree();
    jdbc.update(
        "INSERT INTO categories(name,slug) VALUES (?,?)", "Catalog category", "catalog-category");
    assertThat(categories.getCategoryTree())
        .extracting(CategoryResponse::name)
        .contains("Catalog category");

    jdbc.update("UPDATE categories SET name=? WHERE slug=?", "Updated category", "catalog-category");
    assertThat(categories.getCategoryTree())
        .extracting(CategoryResponse::name)
        .contains("Updated category")
        .doesNotContain("Catalog category");
  }

  @Test
  void migrationsKeepTheRequiredTables() {
    for (String table :
        java.util.List.of(
            "return_items",
            "media_assets",
            "review_photos",
            "store_settings",
            "payment_reconciliation"))
      assertThat(
              jdbc.queryForObject(
                  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND"
                      + " table_name=?",
                  Integer.class,
                  table))
          .isEqualTo(1);
  }

  @Test
  void globalFacetsAcceptAnUnspecifiedCategory() {
    assertThat(facets.facets(null)).isNotNull();
  }
}
