package com.buyora.api.search.service;

import com.buyora.api.brand.entity.Brand;
import com.buyora.api.category.entity.Category;
import com.buyora.api.product.entity.Product;
import com.buyora.api.product.entity.ProductImage;
import com.buyora.api.product.entity.ProductStatus;
import com.buyora.api.search.dto.SearchSuggestionResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public SearchSuggestionResponse getSuggestions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new SearchSuggestionResponse(List.of(), List.of(), List.of());
        }

        String searchPattern = "%" + query.trim().toLowerCase() + "%";

        List<Product> products = entityManager.createQuery(
                "SELECT p FROM Product p WHERE p.status = :status AND LOWER(p.name) LIKE :query ORDER BY p.name ASC", Product.class)
                .setParameter("status", ProductStatus.ACTIVE)
                .setParameter("query", searchPattern)
                .setMaxResults(5)
                .getResultList();

        List<Category> categories = entityManager.createQuery(
                "SELECT c FROM Category c WHERE c.active = true AND LOWER(c.name) LIKE :query ORDER BY c.name ASC", Category.class)
                .setParameter("query", searchPattern)
                .setMaxResults(5)
                .getResultList();

        List<Brand> brands = entityManager.createQuery(
                "SELECT b FROM Brand b WHERE b.active = true AND LOWER(b.name) LIKE :query ORDER BY b.name ASC", Brand.class)
                .setParameter("query", searchPattern)
                .setMaxResults(5)
                .getResultList();

        return new SearchSuggestionResponse(
                products.stream().map(this::mapProduct).collect(Collectors.toList()),
                categories.stream().map(this::mapCategory).collect(Collectors.toList()),
                brands.stream().map(this::mapBrand).collect(Collectors.toList())
        );
    }

    private SearchSuggestionResponse.ProductSuggestion mapProduct(Product p) {
        String imageUrl = null;
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            imageUrl = p.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(p.getImages().get(0).getUrl());
        }
        return new SearchSuggestionResponse.ProductSuggestion(p.getPublicId(), p.getName(), p.getSlug(), imageUrl);
    }

    private SearchSuggestionResponse.CategorySuggestion mapCategory(Category c) {
        return new SearchSuggestionResponse.CategorySuggestion(c.getPublicId(), c.getName(), c.getSlug());
    }

    private SearchSuggestionResponse.BrandSuggestion mapBrand(Brand b) {
        return new SearchSuggestionResponse.BrandSuggestion(b.getPublicId(), b.getName(), b.getSlug());
    }
}
