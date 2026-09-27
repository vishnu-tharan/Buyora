package com.buyora.api.product.repository;

import com.buyora.api.product.entity.AttributeDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AttributeDefinitionRepository extends JpaRepository<AttributeDefinition, Long> {
    Optional<AttributeDefinition> findBySlug(String slug);
}
