package com.buyora.api.auth.service;

import com.buyora.api.auth.dto.*;
import com.buyora.api.auth.entity.EmailVerificationToken;
import com.buyora.api.auth.entity.PasswordResetToken;
import com.buyora.api.auth.repository.EmailVerificationTokenRepository;
import com.buyora.api.auth.repository.PasswordResetTokenRepository;
import com.buyora.api.common.exception.ConflictException;
import com.buyora.api.common.exception.UnauthorizedException;
import com.buyora.api.common.util.SecureTokenGenerator;
import com.buyora.api.notification.service.NotificationService;
import com.buyora.api.user.entity.Role;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.entity.UserStatus;
import com.buyora.api.user.repository.RoleRepository;
import com.buyora.api.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationService notificationService;
    private final SecureTokenGenerator secureTokenGenerator;
    private final com.buyora.api.common.config.BuyoraProperties properties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "Email already exists");
        }

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .build();
        user.getRoles().add(customerRole);
        
        user = userRepository.save(user);

        String rawToken = secureTokenGenerator.generate();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .tokenHash(hashToken(rawToken))
                .user(user)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        notificationService.sendEmailVerification(user.getEmail(), user.getFirstName(), properties.getFrontendUrl() + "/verify-email?token=" + rawToken);

        return AuthResponse.from(user);
    }

    @Transactional
    public String[] login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.isActive() && user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new UnauthorizedException("Account is not active");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user, httpRequest.getHeader("User-Agent"), httpRequest.getRemoteAddr());

        return new String[]{accessToken, refreshToken};
    }

    @Transactional
    public String refresh(String rawRefreshToken) {
        var validToken = refreshTokenService.findValidRefreshToken(rawRefreshToken);
        User user = validToken.getUser();
        if (!user.isActive()) {
            throw new UnauthorizedException("Account is not active");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRoles().stream().map(r -> r.getName()).toArray(String[]::new))
                .build();

        return jwtService.generateAccessToken(userDetails);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null) {
            refreshTokenService.revokeRefreshToken(rawRefreshToken);
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            String rawToken = secureTokenGenerator.generate();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .tokenHash(hashToken(rawToken))
                    .user(user)
                    .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                    .build();
            passwordResetTokenRepository.save(resetToken);
            notificationService.sendPasswordReset(user.getEmail(), user.getFirstName(), properties.getFrontendUrl() + "/reset-password?token=" + rawToken);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.token());
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .filter(PasswordResetToken::isValid)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired reset token"));

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        token.setUsed(true);
        token.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(token);

        refreshTokenService.revokeAllUserTokens(user);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        String tokenHash = hashToken(request.token());
        EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .filter(EmailVerificationToken::isValid)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired verification token"));

        User user = token.getUser();
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        token.setUsed(true);
        token.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(token);
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
