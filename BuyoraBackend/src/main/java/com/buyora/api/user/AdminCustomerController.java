package com.buyora.api.user;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {
  private final AdminCustomerService customers;

  @GetMapping
  public Page<Map<String, Object>> list(Pageable pageable) {
    return customers.list(pageable);
  }

  @GetMapping("/{id}")
  public Map<String, Object> detail(@PathVariable Long id) {
    return customers.detail(id);
  }
}
