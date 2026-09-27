package com.buyora.api.inventory.repository;

import com.buyora.api.inventory.entity.InventoryItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM InventoryItem i WHERE i.variant.id = :variantId")
    Optional<InventoryItem> findByVariantIdForUpdate(@Param("variantId") Long variantId);

    Optional<InventoryItem> findByVariantId(Long variantId);

    long countByStockQuantityLessThan(int threshold);
}
