package com.buyora.api.product.controller;
import com.buyora.api.product.service.CatalogService;
import com.buyora.api.product.dto.ProductFilterRequest;
import com.buyora.api.common.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final CatalogService catalog;
    @GetMapping({"", "/search"})
    public PagedResponse<Map<String, Object>> list(@Valid @ModelAttribute ProductFilterRequest filter) { return catalog.list(filter); }
    @GetMapping("/suggestions")
    public List<Map<String, Object>> suggestions(@RequestParam String q) {
        if (q.trim().length() < 2) return List.of();
        var filter = new ProductFilterRequest(q, null, null, null, null, null, null, null, "NEWEST", 0, 8);
        return catalog.list(filter).getContent().stream().map(p -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("type", "product"); item.put("id", p.get("id")); item.put("name", p.get("name"));
            item.put("slug", p.get("slug")); item.put("price", p.get("basePrice"));
            if (p.get("primaryImage") instanceof Map<?, ?> image) item.put("imageUrl", image.get("url"));
            return item;
        }).toList();
    }
    @GetMapping("/by-id/{id}") public Map<String, Object> byId(@PathVariable Long id) { return catalog.byId(id); }
    @GetMapping("/{slug}")
    public Map<String, Object> detail(@PathVariable String slug) { return catalog.detail(slug); }
    @GetMapping("/featured") public List<Map<String, Object>> featured() { return catalog.featured("featured"); }
    @GetMapping("/new-arrivals") public List<Map<String, Object>> newArrivals() { return catalog.featured("new-arrivals"); }
    @GetMapping("/best-sellers") public List<Map<String, Object>> bestSellers() { return catalog.featured("best-sellers"); }
}
