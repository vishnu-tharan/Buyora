package com.buyora.api.shipping.service;

import com.buyora.api.shipping.dto.ShippingMethodDto;
import com.buyora.api.shipping.repository.ShippingMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingMethodRepository shippingMethodRepository;

    @Transactional(readOnly = true)
    public List<ShippingMethodDto> getActiveShippingMethods() {
        return shippingMethodRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(sm -> ShippingMethodDto.builder()
                        .id(sm.getId())
                        .name(sm.getName())
                        .description(sm.getDescription())
                        .baseRate(sm.getBaseRate())
                        .build())
                .collect(Collectors.toList());
    }
}
