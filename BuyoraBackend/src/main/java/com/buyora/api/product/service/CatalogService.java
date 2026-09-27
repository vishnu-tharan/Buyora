package com.buyora.api.product.service;

import com.buyora.api.product.entity.*;
import com.buyora.api.product.repository.ProductRepository;
import com.buyora.api.product.dto.ProductFilterRequest;
import com.buyora.api.inventory.repository.InventoryItemRepository;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.common.dto.PagedResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {
    private final ProductRepository products;
    private final InventoryItemRepository inventory;
    private final ObjectMapper json;

    public PagedResponse<Map<String, Object>> list(ProductFilterRequest filter) {
        var page = PageRequest.of(filter.page() == null ? 0 : Math.max(0, filter.page()),
                filter.size() == null ? 20 : Math.max(1, Math.min(100, filter.size())));
        return PagedResponse.of(products.findAll((root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();
            conditions.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));
            if (filter.q() != null && !filter.q().isBlank()) conditions.add(cb.like(cb.lower(root.get("name")), "%" + filter.q().toLowerCase(Locale.ROOT) + "%"));
            if (filter.categorySlug() != null) conditions.add(cb.equal(root.get("category").get("slug"), filter.categorySlug()));
            if (filter.brandSlugs() != null && !filter.brandSlugs().isEmpty()) conditions.add(root.get("brand").get("slug").in(filter.brandSlugs()));
            if (filter.minRating() != null) conditions.add(cb.ge(root.get("averageRating"), filter.minRating()));
            var variants = query.subquery(Long.class);
            var variant = variants.from(ProductVariant.class);
            List<Predicate> matching = new ArrayList<>();
            matching.add(cb.equal(variant.get("product"), root));
            matching.add(cb.isTrue(variant.get("active")));
            if (filter.minPrice() != null) matching.add(cb.ge(variant.get("price"), filter.minPrice()));
            if (filter.maxPrice() != null) matching.add(cb.le(variant.get("price"), filter.maxPrice()));
            if (Boolean.TRUE.equals(filter.hasDiscount())) matching.add(cb.greaterThan(variant.get("compareAtPrice"), variant.get("price")));
            if (Boolean.TRUE.equals(filter.inStock())) {
                var stock = variants.from(com.buyora.api.inventory.entity.InventoryItem.class);
                matching.add(cb.equal(stock.get("variant"), variant));
                matching.add(cb.gt(cb.diff(stock.<Integer>get("stockQuantity"), stock.<Integer>get("reservedQuantity")), 0));
            }
            variants.select(variant.get("id")).where(matching.toArray(Predicate[]::new));
            conditions.add(cb.exists(variants));
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                String sort = filter.sort() == null ? "NEWEST" : filter.sort();
                if (sort.equals("PRICE_ASC") || sort.equals("PRICE_DESC")) {
                    var priceQuery = query.subquery(BigDecimal.class);
                    var priceVariant = priceQuery.from(ProductVariant.class);
                    priceQuery.select(cb.min(priceVariant.<BigDecimal>get("price")))
                            .where(cb.equal(priceVariant.get("product"), root), cb.isTrue(priceVariant.get("active")));
                    query.orderBy(sort.equals("PRICE_ASC") ? cb.asc(priceQuery) : cb.desc(priceQuery), cb.asc(root.get("id")));
                } else {
                    query.orderBy(cb.desc(root.get(sort.equals("RATING") ? "averageRating" : sort.equals("BEST_SELLING") ? "bestSeller" : "createdAt")), cb.asc(root.get("id")));
                }
            }
            return cb.and(conditions.toArray(Predicate[]::new));
        }, page).map(this::response));
    }

    public Map<String, Object> byId(Long id) {
        return response(products.findById(id).filter(p -> p.getStatus() == ProductStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }
    public Map<String, Object> detail(String slug) {
        return response(products.findBySlug(slug).filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }

    public List<Map<String, Object>> featured(String group) {
        var rows = switch (group) {
            case "new-arrivals" -> products.findTop8ByStatusAndNewArrivalTrueOrderByCreatedAtDesc(ProductStatus.ACTIVE);
            case "best-sellers" -> products.findTop8ByStatusAndBestSellerTrueOrderByCreatedAtDesc(ProductStatus.ACTIVE);
            default -> products.findTop8ByStatusAndFeaturedTrueOrderByCreatedAtDesc(ProductStatus.ACTIVE);
        };
        return rows.stream().map(this::response).toList();
    }

    public Map<String, Object> response(Product product) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", product.getId()); result.put("name", product.getName()); result.put("slug", product.getSlug());
        result.put("status", product.getStatus()); result.put("description", product.getDescription()); result.put("shortDescription", product.getShortDescription());
        result.put("category", Map.of("id", product.getCategory().getId(), "name", product.getCategory().getName(), "slug", product.getCategory().getSlug(), "level", product.getCategory().getLevel()));
        if (product.getBrand() != null) result.put("brand", Map.of("id", product.getBrand().getId(), "name", product.getBrand().getName(), "slug", product.getBrand().getSlug()));
        var images = product.getImages().stream().sorted(Comparator.comparingInt(ProductImage::getSortOrder)).map(this::image).toList();
        result.put("images", images);
        result.put("primaryImage", product.getImages().stream().filter(ProductImage::isPrimary).findFirst().map(this::image).orElse(images.isEmpty() ? null : images.getFirst()));
        List<Map<String, Object>> variants = new ArrayList<>();
        Map<String, Map<String, Object>> attributes = new LinkedHashMap<>();
        BigDecimal minPrice = null;
        for (var variant : product.getVariants()) {
            if (!variant.isActive()) continue;
            Map<String, Object> value = new LinkedHashMap<>();
            value.put("id", variant.getId()); value.put("sku", variant.getSku()); value.put("price", variant.getPrice());
            value.put("compareAtPrice", variant.getCompareAtPrice()); value.put("isActive", true);
            var stock = inventory.findByVariantId(variant.getId());
            value.put("availableQuantity", stock.map(i -> i.getAvailableQuantity()).orElse(0));
            value.put("stockQuantity", stock.map(i -> i.getStockQuantity()).orElse(0));
            value.put("reservedQuantity", stock.map(i -> i.getReservedQuantity()).orElse(0));
            Map<String, String> selections = new LinkedHashMap<>();
            for (var attribute : variant.getVariantAttributes()) {
                var definition = attribute.getAttributeDefinition();
                selections.put(definition.getSlug(), attribute.getValue());
                var group = attributes.computeIfAbsent(definition.getSlug(), key -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("id", definition.getId()); entry.put("name", definition.getName()); entry.put("slug", key);
                    entry.put("values", new LinkedHashMap<String, Map<String, Object>>()); return entry;
                });
                @SuppressWarnings("unchecked")
                var values = (Map<String, Map<String, Object>>) group.get("values");
                values.putIfAbsent(attribute.getValue(), Map.of("id", attribute.getId(), "value", attribute.getValue(), "order", values.size()));
            }
            value.put("attributes", selections); value.put("images", variant.getImages().stream().map(this::image).toList());
            variants.add(value);
            minPrice = minPrice == null ? variant.getPrice() : minPrice.min(variant.getPrice());
        }
        for (var group : attributes.values()) group.put("values", new ArrayList<>(((Map<?, ?>) group.get("values")).values()));
        result.put("variants", variants); result.put("attributes", new ArrayList<>(attributes.values()));
        result.put("basePrice", minPrice == null ? BigDecimal.ZERO : minPrice);
        result.put("averageRating", product.getAverageRating()); result.put("reviewCount", product.getReviewCount());
        result.put("isFeatured", product.isFeatured()); result.put("isNewArrival", product.isNewArrival()); result.put("isBestSeller", product.isBestSeller());
        result.put("seoTitle", product.getSeoTitle()); result.put("seoDescription", product.getSeoDescription());
        result.put("shippingInfo", product.getShippingInfo()); result.put("returnInfo", product.getReturnInfo());
        result.put("createdAt", product.getCreatedAt()); result.put("updatedAt", product.getUpdatedAt());
        if (product.getSpecifications() != null) {
            try { result.put("specifications", json.readValue(product.getSpecifications(), Map.class)); }
            catch (com.fasterxml.jackson.core.JsonProcessingException error) { throw new IllegalStateException("Invalid product specifications", error); }
        }
        return result;
    }

    private Map<String, Object> image(ProductImage image) {
        return Map.of("id", image.getId(), "url", image.getUrl(), "altText", image.getAltText() == null ? "" : image.getAltText(), "order", image.getSortOrder(), "isPrimary", image.isPrimary());
    }
}
