package com.buyora.api.user;

import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.common.exception.UnauthorizedException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;
  private final com.buyora.api.auth.RefreshTokenService refreshTokens;

  @Transactional(readOnly = true)
  public UserProfileResponse getCurrentUser(String email) {
    return userMapper.toProfileResponse(findByEmail(email));
  }

  @Transactional
  public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
    User user = findByEmail(email);
    user.setFirstName(request.firstName());
    user.setLastName(request.lastName());
    user.setPhone(request.phone());
    return userMapper.toProfileResponse(userRepository.save(user));
  }

  @Transactional
  public void changePassword(String email, ChangePasswordRequest request) {
    User user = findByEmail(email);
    if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new UnauthorizedException("Incorrect current password");
    }
    user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    refreshTokens.revokeAllUserTokens(user);
    userRepository.save(user);
  }

  @Transactional(readOnly = true)
  public User getUserByPublicId(UUID publicId) {
    return userRepository
        .findByPublicId(publicId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  public User findByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
