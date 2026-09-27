package com.buyora.api.product.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record CreateVariantRequest(
    @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=100) String sku,
    @NotNull @DecimalMin("0.00") BigDecimal price,
    @DecimalMin("0.00") BigDecimal compareAtPrice,
    @DecimalMin("0.00") BigDecimal costPrice,
    Integer weightGrams,
    Boolean active,
    Integer sortOrder,
    @jakarta.validation.Valid List<VariantAttributeRequest> attributes
) {}
