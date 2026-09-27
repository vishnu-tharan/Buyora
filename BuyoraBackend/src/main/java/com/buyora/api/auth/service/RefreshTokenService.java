package com.buyora.api.auth.service;

import com.buyora.api.auth.entity.RefreshToken;
import com.buyora.api.auth.repository.RefreshTokenRepository;
import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.common.exception.UnauthorizedException;
import com.buyora.api.common.util.SecureTokenGenerator;
import com.buyora.api.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final BuyoraProperties properties;
    private final SecureTokenGenerator secureTokenGenerator;

    @Transactional
    public String createRefreshToken(User user, String userAgent, String ipAddress) {
        String rawToken = secureTokenGenerator.generate();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .expiresAt(Instant.now().plus(properties.getSecurity().getJwt().getRefreshTokenExpiryDays(), ChronoUnit.DAYS))
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional(readOnly = true)
    public RefreshToken findValidRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        return refreshTokenRepository.findByTokenHash(tokenHash)
                .filter(RefreshToken::isValid)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));
    }

    @Transactional
    public void revokeRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.findAllByUserAndRevokedFalse(user).forEach(token -> {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
        });
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}
