package com.buyora.api.address.repository;

import com.buyora.api.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findAllByUserId(Long userId);
    Optional<Address> findByPublicIdAndUserId(UUID publicId, Long userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefaultShipping = false WHERE a.user.id = :userId")
    void clearDefaultShipping(Long userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefaultBilling = false WHERE a.user.id = :userId")
    void clearDefaultBilling(Long userId);
}
