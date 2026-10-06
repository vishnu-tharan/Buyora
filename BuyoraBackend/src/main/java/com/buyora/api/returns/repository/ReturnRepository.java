package com.buyora.api.returns.repository;

import com.buyora.api.returns.entity.Return;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReturnRepository extends JpaRepository<Return, Long> {
  java.util.List<Return> findByOrderIdOrderByCreatedAtDesc(Long orderId);

  java.util.Optional<Return> findByPublicId(java.util.UUID id);

  boolean existsByOrderId(Long orderId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select r from Return r where r.id = :id")
  java.util.Optional<Return> findForUpdate(
      @org.springframework.data.repository.query.Param("id") Long id);

  Page<Return> findAll(Pageable pageable);
}
