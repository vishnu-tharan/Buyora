package com.buyora.api.shipping.repository;

import com.buyora.api.shipping.entity.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long> {
    List<ShippingMethod> findByActiveTrueOrderBySortOrderAsc();
}
