package com.buyora.api.user;

import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.order.OrderRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {
  private final UserRepository users;
  private final OrderRepository orders;

  public Page<Map<String, Object>> list(Pageable pageable) {
    return users.findAll(pageable).map(this::response);
  }

  public Map<String, Object> detail(Long id) {
    return response(
        users.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found")));
  }

  private Map<String, Object> response(User user) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("id", user.getId());
    result.put("email", user.getEmail());
    result.put("firstName", user.getFirstName());
    result.put("lastName", user.getLastName());
    result.put("phone", user.getPhone());
    result.put("status", user.getStatus());
    result.put("createdAt", user.getCreatedAt());
    result.put("roles", user.getRoles().stream().map(r -> r.getName()).toList());
    result.put("orderCount", orders.countByUserId(user.getId()));
    result.put("totalSpent", orders.paidTotalForUser(user.getId()));
    return result;
  }
}
