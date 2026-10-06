package com.buyora.api.product.controller;

import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class FacetController {
  private final JdbcTemplate jdbc;

  @GetMapping("/api/v1/products/facets")
  public List<Map<String, Object>> facets(@RequestParam(required = false) String categorySlug) {
    var rows =
        jdbc.queryForList(
            "WITH RECURSIVE cats AS (SELECT id FROM categories WHERE slug=? UNION ALL SELECT c.id"
                + " FROM categories c JOIN cats ON c.parent_id=cats.id) SELECT DISTINCT"
                + " d.slug,d.name,a.value FROM variant_attributes a JOIN attribute_definitions d ON"
                + " d.id=a.attribute_definition_id JOIN product_variants v ON v.id=a.variant_id"
                + " JOIN products p ON p.id=v.product_id WHERE d.filterable AND v.active AND"
                + " p.status='ACTIVE' AND (CAST(? AS text) IS NULL OR p.category_id IN (SELECT id"
                + " FROM cats)) ORDER BY d.name,a.value",
            categorySlug,
            categorySlug);
    Map<String, Map<String, Object>> groups = new LinkedHashMap<>();
    for (var row : rows) {
      var group =
          groups.computeIfAbsent(
              (String) row.get("slug"),
              s -> {
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("slug", s);
                g.put("name", row.get("name"));
                g.put("values", new ArrayList<String>());
                return g;
              });
      @SuppressWarnings("unchecked")
      var values = (List<String>) group.get("values");
      values.add((String) row.get("value"));
    }
    return new ArrayList<>(groups.values());
  }
}
