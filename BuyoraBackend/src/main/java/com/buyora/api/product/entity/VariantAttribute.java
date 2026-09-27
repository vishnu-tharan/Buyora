package com.buyora.api.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variant_attributes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VariantAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_definition_id", nullable = false)
    private AttributeDefinition attributeDefinition;

    @Column(nullable = false)
    private String value;

    @Column(name = "display_value")
    private String displayValue;

    @Column(name = "color_code")
    private String colorCode;
}
