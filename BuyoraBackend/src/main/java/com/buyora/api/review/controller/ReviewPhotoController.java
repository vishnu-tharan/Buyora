package com.buyora.api.review.controller;

import com.buyora.api.common.security.CurrentUser;
import com.buyora.api.order.repository.OrderRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class ReviewPhotoController {
  private final CurrentUser currentUser;
  private final OrderRepository orders;
  private final JdbcTemplate jdbc;

  @PostMapping("/api/v1/products/{id}/review-photos")
  public Map<String, Object> upload(@PathVariable Long id, @RequestParam MultipartFile file)
      throws java.io.IOException {
    Long user = currentUser.requireId();
    if (!orders.hasDeliveredProduct(user, id))
      throw new com.buyora.api.common.exception.BusinessException(
          "PURCHASE_REQUIRED", "Customer photos require a delivered purchase");
    if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024)
      throw new IllegalArgumentException("Choose an image under 5 MB");
    var bytes = file.getBytes();
    String type = com.buyora.api.media.MediaController.detect(bytes);
    if (type == null) throw new IllegalArgumentException("Use PNG, JPEG, or WebP");
    UUID asset = UUID.randomUUID();
    jdbc.update(
        "INSERT INTO media_assets(id,content_type,content,owner_id,public_asset) VALUES"
            + " (?,?,?,?,FALSE)",
        asset,
        type,
        bytes,
        user);
    return Map.of("url", "/media/" + asset);
  }
}
