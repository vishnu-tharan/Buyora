package com.buyora.api.shipping;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long> {
  List<ShippingMethod> findByActiveTrueOrderBySortOrderAsc();
}
