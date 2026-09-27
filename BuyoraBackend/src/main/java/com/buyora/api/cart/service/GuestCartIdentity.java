package com.buyora.api.cart.service;

import com.buyora.api.common.config.BuyoraProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GuestCartIdentity {
    private final BuyoraProperties properties;

    public String resolve(String cookie, HttpServletResponse response) {
        if (cookie != null && cookie.matches("[0-9a-fA-F-]{36}")) return cookie;
        String identity = UUID.randomUUID().toString();
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("buyora_guest_cart", identity)
                .httpOnly(true).secure(properties.getSecurity().getCookie().isSecure())
                .sameSite("Lax").path("/api/v1").maxAge(48 * 3600).build().toString());
        return identity;
    }
}
