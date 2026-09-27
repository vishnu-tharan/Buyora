package com.buyora.api.inventory.service;

import com.buyora.api.common.exception.BusinessException;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.inventory.dto.InventoryResponse;
import com.buyora.api.inventory.entity.InventoryItem;
import com.buyora.api.inventory.entity.InventoryTransaction;
import com.buyora.api.inventory.entity.InventoryTransactionType;
import com.buyora.api.inventory.repository.InventoryItemRepository;
import com.buyora.api.inventory.repository.InventoryTransactionRepository;
import com.buyora.api.product.entity.ProductVariant;
import com.buyora.api.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final com.buyora.api.order.repository.OrderRepository orderRepository;

    @Override @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Map<String, Object>> list(org.springframework.data.domain.Pageable pageable) {
        return inventoryItemRepository.findAll(pageable).map(item -> {
            Map<String, Object> result = new java.util.LinkedHashMap<>();
            result.put("id", item.getId()); result.put("variantId", item.getVariant().getId()); result.put("sku", item.getVariant().getSku());
            result.put("productName", item.getVariant().getProduct().getName()); result.put("availableQuantity", item.getAvailableQuantity());
            result.put("reservedQuantity", item.getReservedQuantity()); result.put("totalQuantity", item.getStockQuantity()); result.put("lowStockThreshold", item.getLowStockThreshold());
            result.put("status", item.getAvailableQuantity() == 0 ? "OUT_OF_STOCK" : item.getAvailableQuantity() <= item.getLowStockThreshold() ? "LOW_STOCK" : "IN_STOCK");
            return result;
        });
    }
    @Override
    @Transactional
    public InventoryResponse adjustStock(Long variantId, int quantity, String reason) {
        InventoryItem item = inventoryItemRepository.findByVariantIdForUpdate(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found for variant " + variantId));

        item.setStockQuantity(Math.addExact(item.getStockQuantity(), quantity));
        
        if (item.getStockQuantity() < item.getReservedQuantity()) {
            throw new BusinessException("NEGATIVE_STOCK", "Stock cannot fall below reserved quantity");
        }

        inventoryItemRepository.save(item);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setVariant(item.getVariant());
        tx.setType(quantity > 0 ? InventoryTransactionType.RESTOCK : InventoryTransactionType.ADJUSTMENT);
        tx.setQuantity(quantity);
        tx.setNotes(reason);
        inventoryTransactionRepository.save(tx);

        return mapToResponse(item);
    }

    @Override
    @Transactional
    public void reserveStock(Map<Long, Integer> variantQuantities, String referenceId) {
        for (Map.Entry<Long, Integer> entry : new java.util.TreeMap<>(variantQuantities).entrySet()) {
            Long variantId = entry.getKey();
            Integer quantity = entry.getValue();
            if (quantity == null || quantity <= 0) throw new BusinessException("INVALID_QUANTITY", "Quantity must be positive");

            InventoryItem item = inventoryItemRepository.findByVariantIdForUpdate(variantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found for variant " + variantId));

            if (item.getAvailableQuantity() < quantity) {
                throw new BusinessException("INSUFFICIENT_STOCK", "Insufficient stock for variant " + variantId);
            }

            item.setReservedQuantity(Math.addExact(item.getReservedQuantity(), quantity));
            inventoryItemRepository.save(item);
            record(item, InventoryTransactionType.RESERVATION, quantity, referenceId);
        }
    }

    @Override
    @Transactional
    public void releaseStock(String referenceId) {
        settleReservation(referenceId, false);
    }

    @Override
    @Transactional
    public void confirmStock(String referenceId) {
        settleReservation(referenceId, true);
    }

    private void settleReservation(String referenceId, boolean sale) {
        // Serialize callbacks and cancellations for the same order before locking stock.
        orderRepository.findForUpdate(referenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        var transactions = inventoryTransactionRepository.findByReferenceId(referenceId);
        if (transactions.stream().anyMatch(tx -> tx.getType() == InventoryTransactionType.SALE
                || tx.getType() == InventoryTransactionType.RELEASE)) return;
        var reservations = transactions.stream()
                .filter(tx -> tx.getType() == InventoryTransactionType.RESERVATION)
                .sorted(java.util.Comparator.comparing(tx -> tx.getVariant().getId())).toList();
        if (reservations.isEmpty()) throw new BusinessException("MISSING_RESERVATION", "Order requires inventory reconciliation");
        for (var reservation : reservations) {
            var item = inventoryItemRepository.findByVariantIdForUpdate(reservation.getVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
            int quantity = reservation.getQuantity();
            if (item.getReservedQuantity() < quantity) throw new BusinessException("INVALID_RESERVATION", "Inventory requires reconciliation");
            item.setReservedQuantity(item.getReservedQuantity() - quantity);
            if (sale) item.setStockQuantity(item.getStockQuantity() - quantity);
            inventoryItemRepository.save(item);
            record(item, sale ? InventoryTransactionType.SALE : InventoryTransactionType.RELEASE, quantity, referenceId);
        }
    }

    private void record(InventoryItem item, InventoryTransactionType type, int quantity, String referenceId) {
        var transaction = new InventoryTransaction();
        transaction.setVariant(item.getVariant());
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setReferenceId(referenceId);
        inventoryTransactionRepository.save(transaction);
    }

    private InventoryResponse mapToResponse(InventoryItem item) {
        return new InventoryResponse(
                item.getVariant().getId(),
                item.getStockQuantity(),
                item.getReservedQuantity(),
                item.getAvailableQuantity(),
                item.getLowStockThreshold()
        );
    }
}
