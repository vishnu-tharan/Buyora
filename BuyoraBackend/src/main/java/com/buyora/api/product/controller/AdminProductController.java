package com.buyora.api.product.controller;

import com.buyora.api.product.dto.admin.AdminProductResponse;
import com.buyora.api.product.dto.admin.CreateProductRequest;
import com.buyora.api.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {
    private final ProductService productService;

    @GetMapping public org.springframework.data.domain.Page<java.util.Map<String, Object>> list(org.springframework.data.domain.Pageable pageable) { return productService.list(pageable); }
    @GetMapping("/{id}") public java.util.Map<String, Object> detail(@PathVariable Long id) { return productService.detail(id); }
    @PutMapping("/{id}") public java.util.Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody com.buyora.api.product.dto.admin.UpdateProductRequest request) { return productService.update(id, request); }
    @PostMapping
    public ResponseEntity<AdminProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return new ResponseEntity<>(productService.createProduct(request), HttpStatus.CREATED);
    }
}
