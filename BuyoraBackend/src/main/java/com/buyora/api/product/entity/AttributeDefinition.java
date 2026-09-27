package com.buyora.api.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attribute_definitions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttributeDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttributeType type = AttributeType.TEXT;

    private boolean filterable;

    @Column(name = "sort_order")
    private int sortOrder;
}
