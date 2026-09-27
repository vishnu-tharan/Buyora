package com.buyora.api.payment.provider;

import com.buyora.api.common.config.BuyoraProperties;
import com.buyora.api.order.entity.Order;
import com.buyora.api.payment.dto.PaymentInitiationResponse;
import com.buyora.api.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.RoundingMode;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PayhereProvider implements PaymentProvider {

    private final BuyoraProperties buyoraProperties;
    private final com.fasterxml.jackson.databind.ObjectMapper json;

    @Override
    public String getProviderName() {
        return "PAYHERE";
    }

    @Override
    public boolean supports(String paymentMethod) {
        return "PAYHERE".equalsIgnoreCase(paymentMethod);
    }

    @Override
    public PaymentInitiationResponse initiate(Order order, Payment payment) {
        String merchantId = buyoraProperties.getPayment().getPayhere().getMerchantId();
        String merchantSecret = buyoraProperties.getPayment().getPayhere().getMerchantSecret();
        String paymentUrl = buyoraProperties.getPayment().getPayhere().getPaymentUrl();
        String baseUrl = buyoraProperties.getApiUrl();
        if (merchantId == null || merchantId.isBlank() || merchantSecret == null || merchantSecret.isBlank()) {
            throw new IllegalStateException("PayHere is not configured");
        }

        String orderId = order.getOrderNumber();
        String amount = payment.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString();
        String currency = payment.getCurrency();

        String hash = generateHash(merchantId, orderId, amount, currency, merchantSecret);

        Map<String, String> formData = new HashMap<>();
        formData.put("merchant_id", merchantId);
        formData.put("return_url", buyoraProperties.getFrontendUrl() + "/payment/callback?paymentId=" + payment.getPublicId());
        formData.put("cancel_url", buyoraProperties.getFrontendUrl() + "/payment/callback?paymentId=" + payment.getPublicId());
        formData.put("notify_url", baseUrl + "/api/v1/payments/webhooks/payhere");
        formData.put("order_id", orderId);
        formData.put("items", "Order " + orderId);
        formData.put("currency", currency);
        formData.put("amount", amount);
        
        try {
            var address = json.readTree(order.getShippingSnapshot());
            formData.put("first_name", address.path("firstName").asText());
            formData.put("last_name", address.path("lastName").asText());
            formData.put("email", order.getGuestEmail());
            formData.put("phone", address.path("phone").asText());
            formData.put("address", address.path("addressLine1").asText());
            formData.put("city", address.path("city").asText());
            formData.put("country", address.path("country").asText());
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            throw new IllegalStateException("Order address requires reconciliation", error);
        }
        formData.put("hash", hash);

        return new PaymentInitiationResponse(
                payment.getPublicId(),
                getProviderName(),
                paymentUrl, // Provide the url to Payhere
                formData,
                null
        );
    }

    private String generateHash(String merchantId, String orderId, String amount, String currency, String merchantSecret) {
        try {
            String secretHash = getMd5(merchantSecret).toUpperCase();
            String data = merchantId + orderId + amount + currency + secretHash;
            return getMd5(data).toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating Payhere hash", e);
        }
    }

    private String getMd5(String input) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(input.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
