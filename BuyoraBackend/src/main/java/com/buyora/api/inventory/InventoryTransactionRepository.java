package com.buyora.api.inventory;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
  List<InventoryTransaction> findByVariantId(Long variantId);

  List<InventoryTransaction> findByReferenceId(String referenceId);
}
