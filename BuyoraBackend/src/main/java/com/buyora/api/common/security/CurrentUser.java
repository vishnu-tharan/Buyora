package com.buyora.api.common.security;

import com.buyora.api.auth.SecurityUtils;
import com.buyora.api.common.exception.UnauthorizedException;
import com.buyora.api.user.User;
import com.buyora.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {
  private final UserRepository users;

  public Long optionalId() {
    return SecurityUtils.getCurrentUserEmailOptional()
        .flatMap(users::findByEmail)
        .map(User::getId)
        .orElse(null);
  }

  public Long requireId() {
    return SecurityUtils.getCurrentUserEmailOptional()
        .flatMap(users::findByEmail)
        .map(User::getId)
        .orElseThrow(() -> new UnauthorizedException("Sign in required"));
  }
}
