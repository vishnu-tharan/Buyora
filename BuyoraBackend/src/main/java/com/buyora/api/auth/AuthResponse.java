package com.buyora.api.auth;

import com.buyora.api.user.User;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AuthResponse(
    Long id,
    UUID publicId,
    String email,
    String firstName,
    String lastName,
    String phone,
    List<String> roles,
    Instant createdAt) {
  public static AuthResponse from(User user) {
    return new AuthResponse(
        user.getId(),
        user.getPublicId(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.getPhone(),
        user.getRoles().stream().map(r -> r.getName()).toList(),
        user.getCreatedAt());
  }
}
