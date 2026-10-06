package com.buyora.api.payment.service;

import com.buyora.api.common.config.BuyoraProperties;
import com.fasterxml.jackson.databind.*;
import java.math.BigDecimal;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PayhereMerchantClient {
  private final BuyoraProperties properties;
  private final ObjectMapper json;
  private final HttpClient http =
      HttpClient.newBuilder()
          .connectTimeout(Duration.ofSeconds(5))
          .followRedirects(HttpClient.Redirect.NEVER)
          .build();
  private String accessToken;
  private Instant expiresAt = Instant.EPOCH;
  private long rateWindow;
  private int requests;

  public boolean configured() {
    var p = properties.getPayment().getPayhere();
    return p.isOperationsEnabled()
        && p.getAppId() != null
        && !p.getAppId().isBlank()
        && p.getAppSecret() != null
        && !p.getAppSecret().isBlank();
  }

  private String base() {
    return properties.getPayment().getPayhere().isSandbox()
        ? "https://sandbox.payhere.lk/merchant/v1"
        : "https://www.payhere.lk/merchant/v1";
  }

  private synchronized void permit() {
    long now = System.currentTimeMillis();
    if (now - rateWindow >= 10000) {
      rateWindow = now;
      requests = 0;
    }
    if (++requests > 18)
      throw new IllegalStateException("Payment provider rate limit reached. Try again shortly.");
  }

  private JsonNode call(HttpRequest request) {
    permit();
    try {
      var response = http.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() != 200)
        throw new IllegalStateException("Payment provider request failed");
      return json.readTree(response.body());
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Payment provider request interrupted");
    } catch (java.io.IOException e) {
      throw new IllegalStateException("Payment provider is unavailable");
    }
  }

  private synchronized String token() {
    if (!configured())
      throw new IllegalStateException("PayHere merchant operations are not configured");
    if (accessToken != null && expiresAt.isAfter(Instant.now().plusSeconds(30))) return accessToken;
    var p = properties.getPayment().getPayhere();
    var response =
        call(
            HttpRequest.newBuilder(URI.create(base() + "/oauth/token"))
                .timeout(Duration.ofSeconds(10))
                .header(
                    "Authorization",
                    "Basic "
                        + Base64.getEncoder()
                            .encodeToString(
                                (p.getAppId() + ":" + p.getAppSecret())
                                    .getBytes(StandardCharsets.UTF_8)))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials"))
                .build());
    String value = response.path("access_token").asText("");
    if (value.isBlank()) throw new IllegalStateException("PayHere authorization failed");
    accessToken = value;
    expiresAt = Instant.now().plusSeconds(Math.max(1, response.path("expires_in").asInt(300)));
    return value;
  }

  public JsonNode search(String order) {
    return call(
        HttpRequest.newBuilder(
                URI.create(
                    base()
                        + "/payment/search?order_id="
                        + URLEncoder.encode(order, StandardCharsets.UTF_8)))
            .timeout(Duration.ofSeconds(10))
            .header("Authorization", "Bearer " + token())
            .GET()
            .build());
  }

  public JsonNode refund(String paymentId, BigDecimal amount, String description) {
    try {
      return call(
          HttpRequest.newBuilder(URI.create(base() + "/payment/refund"))
              .timeout(Duration.ofSeconds(15))
              .header("Authorization", "Bearer " + token())
              .header("Content-Type", "application/json")
              .POST(
                  HttpRequest.BodyPublishers.ofString(
                      json.writeValueAsString(
                          Map.of(
                              "payment_id",
                              paymentId,
                              "amount",
                              amount.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString(),
                              "description",
                              description))))
              .build());
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new IllegalArgumentException("Invalid refund request");
    }
  }

  public static boolean matches(
      JsonNode record, String number, BigDecimal amount, String currency) {
    try {
      return record.path("order_id").asText().equals(number)
          && record.path("currency").asText().equals(currency)
          && new BigDecimal(record.path("amount").asText()).compareTo(amount) == 0
          && !record.path("payment_id").asText().isBlank();
    } catch (NumberFormatException e) {
      return false;
    }
  }
}
