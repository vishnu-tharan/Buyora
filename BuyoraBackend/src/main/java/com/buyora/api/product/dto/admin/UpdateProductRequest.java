package com.buyora.api.product.dto.admin;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record UpdateProductRequest(@NotBlank @Size(max=200) String name, @Size(max=1000) String shortDescription,
    @Size(max=20000) String description, @NotNull UUID categoryPublicId, @NotBlank @Pattern(regexp="DRAFT|ACTIVE|ARCHIVED") String status) {}
