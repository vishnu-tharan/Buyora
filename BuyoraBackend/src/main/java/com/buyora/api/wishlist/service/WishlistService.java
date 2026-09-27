package com.buyora.api.wishlist.service;
import com.buyora.api.wishlist.entity.*;
import com.buyora.api.wishlist.repository.WishlistRepository;
import com.buyora.api.user.repository.UserRepository;
import com.buyora.api.product.repository.ProductRepository;
import com.buyora.api.product.entity.ProductStatus;
import com.buyora.api.product.service.CatalogService;
import com.buyora.api.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlists;
    private final UserRepository users;
    private final ProductRepository products;
    private final CatalogService catalog;
    @Transactional(readOnly = true)
    public Map<String, Object> get(Long userId) {
        return response(wishlists.findByUserId(userId).orElse(null));
    }
    @Transactional
    public Map<String, Object> change(Long userId, Long productId, boolean add) {
        var user = users.findForUpdate(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var wishlist = wishlists.findByUserId(userId).orElseGet(() -> Wishlist.builder().user(user).build());
        if (add && wishlist.getItems().stream().noneMatch(i -> i.getProduct().getId().equals(productId))) {
            var product = products.findById(productId).filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            wishlist.getItems().add(WishlistItem.builder().wishlist(wishlist).product(product).build());
        } else if (!add) wishlist.getItems().removeIf(i -> i.getProduct().getId().equals(productId));
        return response(wishlists.saveAndFlush(wishlist));
    }
    private Map<String, Object> response(Wishlist wishlist) {
        if (wishlist == null) return Map.of("items", List.of(), "totalItems", 0);
        var items = wishlist.getItems().stream().filter(i -> i.getProduct().getStatus() == ProductStatus.ACTIVE)
            .map(i -> Map.of("id", i.getId(), "product", catalog.response(i.getProduct()), "addedAt", i.getCreatedAt())).toList();
        return Map.of("items", items, "totalItems", items.size());
    }
}
