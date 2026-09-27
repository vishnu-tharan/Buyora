package com.buyora.api.payment.webhook;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.inventory.service.InventoryService;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.entity.PaymentStatus;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.payment.entity.Payment;
import com.buyora.api.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayhereWebhookHandler {

    private final BuyoraProperties buyoraProperties;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    @Transactional
    public void handle(Map<String, String> formData) {
        String merchantId = formData.get("merchant_id");
        String orderId = formData.get("order_id");
        String payhereAmount = formData.get("payhere_amount");
        String payhereCurrency = formData.get("payhere_currency");
        String statusCode = formData.get("status_code");
        String md5sig = formData.get("md5sig");

        if (md5sig == null || !verifySignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig)) {
            log.error("Invalid PayHere signature for order {}", orderId);
            throw new IllegalArgumentException("Invalid signature");
        }

        Order lockedOrder = orderRepository.findForUpdate(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        Payment payment = paymentRepository.findByOrder_OrderNumber(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order: " + orderId));

        if (!buyoraProperties.getPayment().getPayhere().getMerchantId().equals(merchantId)
                || !payment.getCurrency().equals(payhereCurrency)
                || payment.getAmount().compareTo(new BigDecimal(payhereAmount)) != 0
                || !"PAYHERE".equals(payment.getPaymentMethod())) {
            throw new IllegalArgumentException("Payment details do not match order");
        }
        if (payment.getStatus() == com.buyora.api.payment.entity.PaymentStatus.SUCCESS) {
            log.info("Payment already processed for order {}", orderId);
            return; // Idempotent
        }

        if (payment.getStatus() != com.buyora.api.payment.entity.PaymentStatus.PENDING
                || lockedOrder.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Payment is already finalized");
        }
        Order order = lockedOrder;
        int status = Integer.parseInt(statusCode);

        if (status == 2) {
            payment.setStatus(com.buyora.api.payment.entity.PaymentStatus.SUCCESS);
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.PROCESSING);
            inventoryService.confirmStock(order.getOrderNumber());
        } else if (status < 0) {
            payment.setStatus(com.buyora.api.payment.entity.PaymentStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.CANCELLED);
            inventoryService.releaseStock(order.getOrderNumber());
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    private boolean verifySignature(String merchantId, String orderId, String amount, String currency, String statusCode, String providedSig) {
        try {
            String merchantSecret = buyoraProperties.getPayment().getPayhere().getMerchantSecret();
            if (merchantSecret == null || merchantSecret.isBlank() || merchantId == null || orderId == null || amount == null || currency == null || statusCode == null) return false;
            String secretHash = getMd5(merchantSecret).toUpperCase();
            String data = merchantId + orderId + amount + currency + statusCode + secretHash;
            String computedSig = getMd5(data).toUpperCase();
            return MessageDigest.isEqual(computedSig.getBytes(java.nio.charset.StandardCharsets.UTF_8), providedSig.toUpperCase(java.util.Locale.ROOT).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            log.error("Hashing error", e);
            return false;
        }
    }

    private String getMd5(String input) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
