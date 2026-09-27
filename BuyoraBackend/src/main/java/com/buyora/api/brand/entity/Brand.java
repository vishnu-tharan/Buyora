package com.buyora.api.brand.entity;

import com.buyora.api.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "brands")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Brand extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "logo_alt")
    private String logoAlt;

    @Column(name = "website_url")
    private String websiteUrl;

    private boolean active;

    @Column(name = "sort_order")
    private int sortOrder;

    @PrePersist
    protected void onCreate() {
        if (publicId == null) publicId = UUID.randomUUID();
        active = true;
    }
}
