package com.buyora.api.user;

import org.springframework.stereotype.Component;

@Component
public class UserMapper {
  public UserProfileResponse toProfileResponse(User user) {
    if (user == null) return null;
    return new UserProfileResponse(
        user.getPublicId(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.getPhone(),
        user.getStatus(),
        user.getCreatedAt());
  }
}
