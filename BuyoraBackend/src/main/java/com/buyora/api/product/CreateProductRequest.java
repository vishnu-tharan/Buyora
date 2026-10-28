package com.buyora.api.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateProductRequest(
    @NotBlank @jakarta.validation.constraints.Size(max = 200) String name,
    String slug,
    String shortDescription,
    String description,
    @NotNull UUID categoryPublicId,
    UUID brandPublicId,
    String status,
    Boolean featured,
    Boolean newArrival,
    Boolean bestSeller,
    List<String> tags,
    String seoTitle,
    String seoDescription,
    String specifications,
    String shippingInfo,
    String returnInfo,
    @jakarta.validation.Valid @jakarta.validation.constraints.NotEmpty
        List<CreateVariantRequest> variants) {}
