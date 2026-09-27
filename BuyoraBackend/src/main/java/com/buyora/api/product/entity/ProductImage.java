package com.buyora.api.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false)
    private String url;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "is_primary")
    private boolean isPrimary;
}
