package com.buyora.api.category;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {
  private final CategoryService categoryService;

  @GetMapping
  public org.springframework.data.domain.Page<CategoryResponse> list(
      org.springframework.data.domain.Pageable pageable) {
    return categoryService.getAll(pageable);
  }

  @PostMapping
  public ResponseEntity<CategoryResponse> createCategory(
      @Valid @RequestBody CategoryRequest request) {
    return new ResponseEntity<>(categoryService.createCategory(request), HttpStatus.CREATED);
  }
}
