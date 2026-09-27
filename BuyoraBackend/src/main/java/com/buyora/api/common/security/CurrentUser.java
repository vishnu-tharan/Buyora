package com.buyora.api.common.security;

import com.buyora.api.auth.security.SecurityUtils;
import com.buyora.api.common.exception.UnauthorizedException;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {
    private final UserRepository users;

    public Long optionalId() {
        return SecurityUtils.getCurrentUserEmailOptional().flatMap(users::findByEmail).map(User::getId).orElse(null);
    }

    public Long requireId() {
        return SecurityUtils.getCurrentUserEmailOptional().flatMap(users::findByEmail)
                .map(User::getId).orElseThrow(() -> new UnauthorizedException("Sign in required"));
    }
}
