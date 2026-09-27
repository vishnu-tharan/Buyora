package com.buyora.api.inventory.repository;

import com.buyora.api.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByVariantId(Long variantId);
    List<InventoryTransaction> findByReferenceId(String referenceId);
}
