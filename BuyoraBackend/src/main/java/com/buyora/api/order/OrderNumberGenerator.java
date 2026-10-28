package com.buyora.api.order;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class OrderNumberGenerator {
  private static final String PREFIX = "ORD";
  private static final SecureRandom RANDOM = new SecureRandom();

  public String generate() {
    String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
    int randomPart = 1000 + RANDOM.nextInt(9000);
    return PREFIX + "-" + datePart + "-" + randomPart;
  }
}
