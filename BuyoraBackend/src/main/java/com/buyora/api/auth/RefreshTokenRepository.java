package com.buyora.api.auth;

import com.buyora.api.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  Optional<RefreshToken> findByTokenHash(String tokenHash);

  void deleteAllByUserAndRevokedFalse(User user);

  List<RefreshToken> findAllByUserAndRevokedFalse(User user);
}
