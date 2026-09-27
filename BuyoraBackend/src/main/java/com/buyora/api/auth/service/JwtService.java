package com.buyora.api.auth.service;

import com.buyora.api.common.config.BuyoraProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    private final BuyoraProperties properties;

    public JwtService(BuyoraProperties properties) {
        this.properties = properties;
    }

    public String generateAccessToken(UserDetails userDetails) {
        Instant now = Instant.now();
        Instant expiry = now.plus(
            properties.getSecurity().getJwt().getAccessTokenExpiryMinutes(),
            ChronoUnit.MINUTES
        );

        List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .toList();

        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .subject(userDetails.getUsername())
            .claim("roles", roles)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(getSigningKey())
            .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String email = extractEmail(token);
            return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith((javax.crypto.SecretKey) getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private Key getSigningKey() {
        byte[] keyBytes = properties.getSecurity().getJwt().getSecret()
            .getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
