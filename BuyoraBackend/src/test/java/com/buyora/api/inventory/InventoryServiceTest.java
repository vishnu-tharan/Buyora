package com.buyora.api.inventory;
import com.buyora.api.inventory.service.InventoryServiceImpl;
import com.buyora.api.inventory.entity.*;
import com.buyora.api.inventory.repository.*;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.order.entity.Order;
import com.buyora.api.product.entity.ProductVariant;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
class InventoryServiceTest {
    final InventoryItemRepository stock = mock(InventoryItemRepository.class);
    final InventoryTransactionRepository transactions = mock(InventoryTransactionRepository.class);
    final OrderRepository orders = mock(OrderRepository.class);
    final InventoryServiceImpl service = new InventoryServiceImpl(stock, transactions, orders);
    InventoryItem item(int available, int reserved) {
        var variant = new ProductVariant(); variant.setId(1L);
        var item = new InventoryItem(); item.setVariant(variant); item.setStockQuantity(available); item.setReservedQuantity(reserved);
        when(stock.findByVariantIdForUpdate(1L)).thenReturn(Optional.of(item));
        return item;
    }
    @Test void rejectsNegativeReservation() {
        assertThatThrownBy(() -> service.reserveStock(Map.of(1L, -1), "ORD-1")).isInstanceOf(RuntimeException.class);
        verifyNoInteractions(stock);
    }
    @Test void preventsOverselling() {
        item(1, 0);
        assertThatThrownBy(() -> service.reserveStock(Map.of(1L, 2), "ORD-1")).isInstanceOf(RuntimeException.class);
        verify(stock, never()).save(any());
    }
    @Test void recordsReservation() {
        var item = item(2, 0); service.reserveStock(Map.of(1L, 1), "ORD-1");
        assertThat(item.getReservedQuantity()).isEqualTo(1);
        verify(transactions).save(argThat(tx -> tx.getType() == InventoryTransactionType.RESERVATION && "ORD-1".equals(tx.getReferenceId())));
    }
    @Test void confirmsOnlyOnce() {
        var item = item(2, 1); var reservation = new InventoryTransaction();
        reservation.setVariant(item.getVariant()); reservation.setQuantity(1); reservation.setType(InventoryTransactionType.RESERVATION);
        when(orders.findForUpdate("ORD-1")).thenReturn(Optional.of(new Order()));
        when(transactions.findByReferenceId("ORD-1")).thenReturn(List.of(reservation));
        service.confirmStock("ORD-1");
        assertThat(item.getStockQuantity()).isEqualTo(1); assertThat(item.getReservedQuantity()).isZero();
        var sale = new InventoryTransaction(); sale.setType(InventoryTransactionType.SALE);
        when(transactions.findByReferenceId("ORD-1")).thenReturn(List.of(reservation, sale));
        service.confirmStock("ORD-1");
        assertThat(item.getStockQuantity()).isEqualTo(1);
    }
    @Test void releasesFailedPaymentWithoutReducingStock() {
        var item = item(2, 1); var reservation = new InventoryTransaction();
        reservation.setVariant(item.getVariant()); reservation.setQuantity(1); reservation.setType(InventoryTransactionType.RESERVATION);
        when(orders.findForUpdate("ORD-1")).thenReturn(Optional.of(new Order()));
        when(transactions.findByReferenceId("ORD-1")).thenReturn(List.of(reservation));
        service.releaseStock("ORD-1");
        assertThat(item.getStockQuantity()).isEqualTo(2); assertThat(item.getReservedQuantity()).isZero();
    }
}
