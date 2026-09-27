package com.buyora.api.user.repository;

import com.buyora.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.id = :id")
    Optional<User> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    Optional<User> findByEmail(String email);
    Optional<User> findByPublicId(UUID publicId);
    boolean existsByEmail(String email);
}
