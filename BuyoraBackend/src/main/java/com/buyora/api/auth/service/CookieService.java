package com.buyora.api.auth.service;

import com.buyora.api.common.config.BuyoraProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class CookieService {

    private final BuyoraProperties properties;

    public ResponseCookie createAccessTokenCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from(properties.getSecurity().getCookie().getAccessCookieName(), token)
                .httpOnly(true)
                .secure(properties.getSecurity().getCookie().isSecure())
                .sameSite(properties.getSecurity().getCookie().getSameSite())
                .path("/api/v1/")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }

    public ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from(properties.getSecurity().getCookie().getRefreshCookieName(), token)
                .httpOnly(true)
                .secure(properties.getSecurity().getCookie().isSecure())
                .sameSite(properties.getSecurity().getCookie().getSameSite())
                .path("/api/v1/auth/refresh")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }

    public ResponseCookie clearAccessTokenCookie() {
        return ResponseCookie.from(properties.getSecurity().getCookie().getAccessCookieName(), "")
                .httpOnly(true)
                .secure(properties.getSecurity().getCookie().isSecure())
                .sameSite(properties.getSecurity().getCookie().getSameSite())
                .path("/api/v1/")
                .maxAge(0)
                .build();
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return ResponseCookie.from(properties.getSecurity().getCookie().getRefreshCookieName(), "")
                .httpOnly(true)
                .secure(properties.getSecurity().getCookie().isSecure())
                .sameSite(properties.getSecurity().getCookie().getSameSite())
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .build();
    }
}
