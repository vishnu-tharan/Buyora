package com.buyora.api.auth.dto;
import com.buyora.api.user.entity.User;
import java.util.List;
import java.time.Instant;
import java.util.UUID;
public record AuthResponse(Long id, UUID publicId, String email, String firstName, String lastName,
    String phone, List<String> roles, boolean isEmailVerified, Instant createdAt) {
    public static AuthResponse from(User user) {
        return new AuthResponse(user.getId(), user.getPublicId(), user.getEmail(), user.getFirstName(), user.getLastName(),
            user.getPhone(), user.getRoles().stream().map(r -> r.getName()).toList(), user.isEmailVerified(), user.getCreatedAt());
    }
}
