package com.buyora.api.auth.repository;

import com.buyora.api.auth.entity.RefreshToken;
import com.buyora.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteAllByUserAndRevokedFalse(User user);
    List<RefreshToken> findAllByUserAndRevokedFalse(User user);
}
