package com.buyora.api.auth.security;

import com.buyora.api.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityUtils {

    public static String getCurrentUserEmail() {
        return getCurrentUserEmailOptional()
            .orElseThrow(() -> new UnauthorizedException("Not authenticated"));
    }

    public static Optional<String> getCurrentUserEmailOptional() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .filter(Authentication::isAuthenticated)
            .map(Authentication::getName)
            .filter(name -> !"anonymousUser".equals(name));
    }

    public static boolean hasRole(String role) {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .map(auth -> auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role)))
            .orElse(false);
    }
}
