package com.buyora.api.common.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.buyora.api.brand.dto.BrandResponse;
import com.buyora.api.category.dto.CategoryResponse;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

class RedisSerializationTest {
  @Test
  void roundTripsImmutableCategoryRecordsAndChildren() {
    var child =
        new CategoryResponse(
            2L,
            UUID.randomUUID(),
            "Child",
            "child",
            null,
            null,
            null,
            null,
            1,
            0,
            true,
            null,
            null,
            List.of());
    var parent =
        new CategoryResponse(
            1L,
            UUID.randomUUID(),
            "Parent",
            "parent",
            null,
            null,
            null,
            null,
            0,
            0,
            true,
            null,
            null,
            List.of(child));
    var serializer = RedisConfig.categorySerializer();
    assertThat(serializer.deserialize(serializer.serialize(List.of(parent))))
        .isEqualTo(List.of(parent));
    assertThat(serializer.deserialize(serializer.serialize(List.of()))).isEmpty();
  }

  @Test
  void roundTripsBrandPageContentAndPagination() {
    var brand =
        new BrandResponse(1L, UUID.randomUUID(), "Brand", "brand", null, null, null, null, true, 0);
    var page =
        new PageImpl<>(List.of(brand), PageRequest.of(1, 2, Sort.by("name").descending()), 5);
    var serializer = new BrandPageRedisSerializer();
    var restored = serializer.deserialize(serializer.serialize(page));
    assertThat(restored.getContent()).isEqualTo(page.getContent());
    assertThat(restored.getPageable()).isEqualTo(page.getPageable());
    assertThat(restored.getTotalElements()).isEqualTo(5);
  }
}
