package com.buyora.api.common.config;

import com.buyora.api.category.dto.CategoryResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(factory);
    template.setKeySerializer(new StringRedisSerializer());
    template.setHashKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
    template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
    template.afterPropertiesSet();
    return template;
  }

  @Bean
  public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    ObjectMapper om = new ObjectMapper();
    om.registerModule(new JavaTimeModule());
    var serializer = new GenericJackson2JsonRedisSerializer(om);

    RedisCacheConfiguration defaults =
        RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .prefixCacheNameWith("buyora:v2:")
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(serializer));

    // Per-cache TTL overrides
    Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
    cacheConfigs.put(
        "categories",
        defaults
            .entryTtl(Duration.ofHours(1))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(categorySerializer())));
    cacheConfigs.put(
        "brands",
        defaults
            .entryTtl(Duration.ofHours(1))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new BrandPageRedisSerializer())));
    cacheConfigs.put("products", defaults.entryTtl(Duration.ofMinutes(5)));
    cacheConfigs.put("shippingMethods", defaults.entryTtl(Duration.ofHours(6)));

    return RedisCacheManager.builder(factory)
        .cacheDefaults(defaults)
        .withInitialCacheConfigurations(cacheConfigs)
        .build();
  }

  static Jackson2JsonRedisSerializer<java.util.List<CategoryResponse>> categorySerializer() {
    ObjectMapper mapper = new ObjectMapper();
    return new Jackson2JsonRedisSerializer<>(
        mapper,
        mapper
            .getTypeFactory()
            .constructCollectionType(java.util.List.class, CategoryResponse.class));
  }
}
