package com.buyora.api.user.dto;

import com.buyora.api.user.entity.UserStatus;
import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
    UUID publicId,
    String email,
    String firstName,
    String lastName,
    String phone,
    boolean emailVerified,
    UserStatus status,
    Instant createdAt
) {}
