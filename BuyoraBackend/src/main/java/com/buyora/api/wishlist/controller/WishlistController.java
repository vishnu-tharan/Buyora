package com.buyora.api.wishlist.controller;
import com.buyora.api.wishlist.service.WishlistService;
import com.buyora.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService service;
    private final CurrentUser currentUser;
    public record AddItem(@NotNull @Positive Long productId) {}
    @GetMapping public Map<String, Object> get() { return service.get(currentUser.requireId()); }
    @PostMapping("/items") public Map<String, Object> add(@Valid @RequestBody AddItem request) { return service.change(currentUser.requireId(), request.productId(), true); }
    @DeleteMapping("/items/{productId}") public Map<String, Object> remove(@PathVariable Long productId) { return service.change(currentUser.requireId(), productId, false); }
}
