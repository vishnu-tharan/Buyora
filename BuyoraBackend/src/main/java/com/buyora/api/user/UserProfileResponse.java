package com.buyora.api.user;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
    UUID publicId,
    String email,
    String firstName,
    String lastName,
    String phone,
    UserStatus status,
    Instant createdAt) {}
