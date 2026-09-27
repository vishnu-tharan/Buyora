package com.buyora.api.common.event;
import com.buyora.api.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
@Component
@RequiredArgsConstructor
public class OrderEventListener {
    private final NotificationService notifications;
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void placed(OrderPlacedEvent event) { notifications.sendOrderConfirmation(event.getUserEmail(), "", event.getOrderNumber()); }
}
