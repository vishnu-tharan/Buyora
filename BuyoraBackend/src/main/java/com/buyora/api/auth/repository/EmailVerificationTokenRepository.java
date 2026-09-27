package com.buyora.api.auth.repository;

import com.buyora.api.auth.entity.EmailVerificationToken;
import com.buyora.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);
    void deleteAllByUser(User user);
}
