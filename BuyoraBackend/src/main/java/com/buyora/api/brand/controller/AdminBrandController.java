package com.buyora.api.brand.controller;

import com.buyora.api.brand.dto.BrandRequest;
import com.buyora.api.brand.dto.BrandResponse;
import com.buyora.api.brand.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {
    private final BrandService brandService;

    @GetMapping public org.springframework.data.domain.Page<BrandResponse> list(org.springframework.data.domain.Pageable pageable) { return brandService.getAll(pageable); }
    @PostMapping
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody BrandRequest request) {
        return new ResponseEntity<>(brandService.createBrand(request), HttpStatus.CREATED);
    }
}
