package com.buyora.api.product.entity;

import com.buyora.api.brand.entity.Brand;
import com.buyora.api.category.entity.Category;
import com.buyora.api.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseAuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, unique = true, updatable = false)
  private UUID publicId;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(name = "short_description")
  private String shortDescription;

  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "brand_id")
  private Brand brand;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private ProductStatus status = ProductStatus.DRAFT;

  private boolean featured;

  @Column(name = "new_arrival")
  private boolean newArrival;

  @Column(name = "best_seller")
  private boolean bestSeller;

  @JdbcTypeCode(SqlTypes.ARRAY)
  @Column(name = "tags", columnDefinition = "text[]")
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  @Column(name = "seo_title")
  private String seoTitle;

  @Column(name = "seo_description")
  private String seoDescription;

  @Column(name = "average_rating")
  private BigDecimal averageRating;

  @Column(name = "review_count")
  private int reviewCount;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "specifications", columnDefinition = "jsonb")
  private String specifications;

  @Column(name = "shipping_info")
  private String shippingInfo;

  @Column(name = "video_url", length = 1000)
  private String videoUrl;

  @Column(name = "return_info")
  private String returnInfo;

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ProductVariant> variants = new ArrayList<>();

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ProductImage> images = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    if (publicId == null) publicId = UUID.randomUUID();
  }
}
