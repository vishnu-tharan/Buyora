package com.buyora.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 128) String password,
    @NotBlank @Size(min = 2, max = 100) String firstName,
    @NotBlank @Size(min = 2, max = 100) String lastName,
    @Pattern(regexp = "^[+0-9\\s\\-()]{7,20}$", message = "Invalid phone format") String phone) {
  public RegisterRequest {
    if (phone != null) {
      phone = phone.trim();
      if (phone.isEmpty()) phone = null;
    }
  }
}
