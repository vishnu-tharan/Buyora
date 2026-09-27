package com.buyora.api.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "buyora")
@Data
public class BuyoraProperties {
    private String frontendUrl = "http://localhost:3000";
    private String apiUrl = "http://localhost:8080";

    private Security security = new Security();
    private Storage storage = new Storage();
    private Email email = new Email();
    private Payment payment = new Payment();
    private Pagination pagination = new Pagination();
    private Inventory inventory = new Inventory();
    private Cart cart = new Cart();
    private Order order = new Order();
    private Return returns = new Return();

    @Data
    public static class Security {
        private Jwt jwt = new Jwt();
        private Cookie cookie = new Cookie();
        private Cors cors = new Cors();

        @Data
        public static class Jwt {
            private String secret;
            private int accessTokenExpiryMinutes = 15;
            private int refreshTokenExpiryDays = 30;
        }

        @Data
        public static class Cookie {
            private boolean secure = true;
            private String sameSite = "Strict";
            private String accessCookieName = "buyora_access";
            private String refreshCookieName = "buyora_refresh";
        }

        @Data
        public static class Cors {
            private List<String> allowedOrigins = List.of("http://localhost:3000");
        }
    }

    @Data
    public static class Storage {
        private String provider = "minio";
        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String bucketName = "buyora-media";
        private String publicBaseUrl;
    }

    @Data
    public static class Email {
        private String fromName = "Buyora";
        private String fromAddress = "noreply@buyora.lk";
    }

    @Data
    public static class Payment {
        private Payhere payhere = new Payhere();
        private Stripe stripe = new Stripe();
        private Cod cod = new Cod();

        @Data public static class Payhere {
            private String merchantId;
            private String merchantSecret;
            private boolean sandbox = true;
            private String paymentUrl;
        }

        @Data public static class Stripe {
            private String secretKey;
            private String webhookSecret;
        }

        @Data public static class Cod {
            private boolean enabled = true;
        }
    }

    @Data
    public static class Pagination {
        private int defaultPageSize = 20;
        private int maxPageSize = 100;
    }

    @Data
    public static class Inventory {
        private int lowStockThresholdDefault = 10;
        private int reservationExpiryMinutes = 30;
    }

    @Data
    public static class Cart {
        private int guestExpiryHours = 48;
    }

    @Data
    public static class Order {
        private String numberPrefix = "ORD";
        private int cancellationWindowHours = 24;
    }

    @Data
    public static class Return {
        private int windowDays = 30;
    }
}
