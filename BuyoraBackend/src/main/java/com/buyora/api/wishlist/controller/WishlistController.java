package com.buyora.api.wishlist.controller;

import com.buyora.api.common.security.CurrentUser;
import com.buyora.api.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {
  private final WishlistService service;
  private final CurrentUser currentUser;

  public record AddItem(@NotNull @Positive Long productId) {}

  public record Merge(
      @NotNull @jakarta.validation.constraints.Size(max = 100)
          java.util.List<@NotNull @Positive Long> productIds) {}

  @PostMapping("/merge")
  public Map<String, Object> merge(@Valid @RequestBody Merge input) {
    return service.merge(currentUser.requireId(), input.productIds());
  }

  @GetMapping
  public Map<String, Object> get() {
    return service.get(currentUser.requireId());
  }

  @PostMapping("/items")
  public Map<String, Object> add(@Valid @RequestBody AddItem request) {
    return service.change(currentUser.requireId(), request.productId(), true);
  }

  @DeleteMapping("/items/{productId}")
  public Map<String, Object> remove(@PathVariable Long productId) {
    return service.change(currentUser.requireId(), productId, false);
  }
}
