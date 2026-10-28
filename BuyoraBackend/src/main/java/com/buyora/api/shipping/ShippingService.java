package com.buyora.api.shipping;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShippingService {

  private final ShippingMethodRepository shippingMethodRepository;

  @Transactional(readOnly = true)
  public List<ShippingMethodDto> getActiveShippingMethods() {
    return shippingMethodRepository.findByActiveTrueOrderBySortOrderAsc().stream()
        .map(
            sm ->
                ShippingMethodDto.builder()
                    .id(sm.getId())
                    .name(sm.getName())
                    .description(sm.getDescription())
                    .baseRate(sm.getBaseRate())
                    .build())
        .collect(Collectors.toList());
  }
}
