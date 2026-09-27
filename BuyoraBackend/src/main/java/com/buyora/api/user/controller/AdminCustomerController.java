package com.buyora.api.user.controller;
import com.buyora.api.user.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.Map;
@RestController @RequestMapping("/api/v1/admin/customers") @RequiredArgsConstructor
public class AdminCustomerController {
    private final AdminCustomerService customers;
    @GetMapping public Page<Map<String, Object>> list(Pageable pageable) { return customers.list(pageable); }
    @GetMapping("/{id}") public Map<String, Object> detail(@PathVariable Long id) { return customers.detail(id); }
}
