package com.buyora.api.auth;

import com.buyora.api.common.exception.ConflictException;
import com.buyora.api.common.exception.UnauthorizedException;
import com.buyora.api.user.Role;
import com.buyora.api.user.RoleRepository;
import com.buyora.api.user.User;
import com.buyora.api.user.UserRepository;
import com.buyora.api.user.UserStatus;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final RefreshTokenService refreshTokenService;

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.email())) {
      throw new ConflictException("EMAIL_ALREADY_EXISTS", "Email already exists");
    }

    Role customerRole =
        roleRepository
            .findByName("ROLE_CUSTOMER")
            .orElseThrow(() -> new RuntimeException("Default role not found"));

    User user =
        User.builder()
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .phone(request.phone())
            .status(UserStatus.ACTIVE)
            .build();
    user.getRoles().add(customerRole);

    user = userRepository.save(user);

    return AuthResponse.from(user);
  }

  @Transactional
  public String[] login(LoginRequest request, HttpServletRequest httpRequest) {
    Authentication auth =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password()));

    UserDetails userDetails = (UserDetails) auth.getPrincipal();
    User user =
        userRepository
            .findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

    if (!user.isActive()) {
      throw new UnauthorizedException("Account is not active");
    }

    user.setLastLoginAt(Instant.now());
    userRepository.save(user);

    String accessToken = jwtService.generateAccessToken(userDetails);
    String refreshToken =
        refreshTokenService.createRefreshToken(
            user, httpRequest.getHeader("User-Agent"), httpRequest.getRemoteAddr());

    return new String[] {accessToken, refreshToken};
  }

  @Transactional
  public String refresh(String rawRefreshToken) {
    var validToken = refreshTokenService.findValidRefreshToken(rawRefreshToken);
    User user = validToken.getUser();
    if (!user.isActive()) {
      throw new UnauthorizedException("Account is not active");
    }

    UserDetails userDetails =
        org.springframework.security.core.userdetails.User.builder()
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

}
