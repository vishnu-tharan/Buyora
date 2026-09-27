package com.buyora.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank @Size(min=2, max=100) String firstName,
    @NotBlank @Size(min=2, max=100) String lastName,
    @Pattern(regexp="^[+0-9\\s\\-()]{7,20}$") String phone
) {}
