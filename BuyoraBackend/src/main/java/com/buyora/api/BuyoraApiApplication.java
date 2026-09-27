package com.buyora.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Buyora E-Commerce REST API
 * Modular monolith architecture with clear domain boundaries.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties
public class BuyoraApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BuyoraApiApplication.class, args);
    }
}
