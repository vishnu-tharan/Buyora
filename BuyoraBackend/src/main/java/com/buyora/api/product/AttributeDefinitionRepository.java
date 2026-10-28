package com.buyora.api.product;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttributeDefinitionRepository extends JpaRepository<AttributeDefinition, Long> {
  Optional<AttributeDefinition> findBySlug(String slug);
}
