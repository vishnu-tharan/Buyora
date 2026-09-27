package com.buyora.api.auth.controller;

import com.buyora.api.auth.dto.*;
import com.buyora.api.auth.service.AuthService;
import com.buyora.api.auth.service.CookieService;
import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final BuyoraProperties properties;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String[] tokens = authService.login(request, httpRequest);
        
        long accessAge = properties.getSecurity().getJwt().getAccessTokenExpiryMinutes() * 60L;
        long refreshAge = properties.getSecurity().getJwt().getRefreshTokenExpiryDays() * 86400L;
        
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(tokens[0], accessAge).toString());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookieService.createRefreshTokenCookie(tokens[1], refreshAge).toString());

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        AuthResponse response = AuthResponse.from(user);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String rawRefreshToken = null;
        if (httpRequest.getCookies() != null) {
            rawRefreshToken = Arrays.stream(httpRequest.getCookies())
                    .filter(c -> properties.getSecurity().getCookie().getRefreshCookieName().equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        if (rawRefreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String newAccessToken = authService.refresh(rawRefreshToken);
        long accessAge = properties.getSecurity().getJwt().getAccessTokenExpiryMinutes() * 60L;
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(newAccessToken, accessAge).toString());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String rawRefreshToken = null;
        if (httpRequest.getCookies() != null) {
            rawRefreshToken = Arrays.stream(httpRequest.getCookies())
                    .filter(c -> properties.getSecurity().getCookie().getRefreshCookieName().equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        authService.logout(rawRefreshToken);
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearAccessTokenCookie().toString());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearRefreshTokenCookie().toString());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        AuthResponse response = AuthResponse.from(user);
        return ResponseEntity.ok(response);
    }
}
