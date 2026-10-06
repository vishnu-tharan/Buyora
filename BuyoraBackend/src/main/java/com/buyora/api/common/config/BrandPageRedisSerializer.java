package com.buyora.api.common.config;

import com.buyora.api.brand.dto.BrandResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

/** Stores a concrete JSON shape, without arbitrary Java type names in Redis. */
final class BrandPageRedisSerializer implements RedisSerializer<Page<BrandResponse>> {
  private final ObjectMapper mapper = new ObjectMapper();

  record Ordering(
      String property,
      Sort.Direction direction,
      boolean ignoreCase,
      Sort.NullHandling nullHandling) {}

  record Snapshot(
      List<BrandResponse> content,
      int number,
      int size,
      long total,
      boolean paged,
      List<Ordering> ordering) {}

  @Override
  public byte[] serialize(Page<BrandResponse> page) {
    if (page == null) return new byte[0];
    var ordering =
        page.getSort().stream()
            .map(
                o ->
                    new Ordering(
                        o.getProperty(), o.getDirection(), o.isIgnoreCase(), o.getNullHandling()))
            .toList();
    try {
      return mapper.writeValueAsBytes(
          new Snapshot(
              page.getContent(),
              page.getNumber(),
              page.getSize(),
              page.getTotalElements(),
              page.getPageable().isPaged(),
              ordering));
    } catch (java.io.IOException error) {
      throw new SerializationException("Cannot serialize brand cache", error);
    }
  }

  @Override
  public Page<BrandResponse> deserialize(byte[] bytes) {
    if (bytes == null || bytes.length == 0) return null;
    try {
      Snapshot data = mapper.readValue(bytes, Snapshot.class);
      Sort sort =
          Sort.by(
              data.ordering().stream()
                  .map(
                      o -> {
                        Sort.Order order =
                            new Sort.Order(o.direction(), o.property(), o.nullHandling());
                        return o.ignoreCase() ? order.ignoreCase() : order;
                      })
                  .toList());
      Pageable pageable =
          data.paged() ? PageRequest.of(data.number(), data.size(), sort) : Pageable.unpaged(sort);
      return new PageImpl<>(data.content(), pageable, data.total());
    } catch (java.io.IOException | IllegalArgumentException error) {
      throw new SerializationException("Cannot deserialize brand cache", error);
    }
  }
}
