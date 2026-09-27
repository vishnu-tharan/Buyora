package com.buyora.api.common.util;

import com.buyora.api.common.config.BuyoraProperties;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class PaginationUtil {

    private final BuyoraProperties properties;

    public PaginationUtil(BuyoraProperties properties) {
        this.properties = properties;
    }

    public PageRequest toPageRequest(int page, int size) {
        int safeSize = Math.min(Math.max(size, 1),
                properties.getPagination().getMaxPageSize());
        return PageRequest.of(Math.max(page, 0), safeSize);
    }

    public PageRequest toPageRequest(int page, int size, Sort sort) {
        int safeSize = Math.min(Math.max(size, 1),
                properties.getPagination().getMaxPageSize());
        return PageRequest.of(Math.max(page, 0), safeSize, sort);
    }
}
