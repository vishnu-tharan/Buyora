package com.buyora.api.address.entity;

import com.buyora.api.common.entity.BaseEntity;
import com.buyora.api.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "addresses")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Address extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String label;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String phone;

    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(nullable = false)
    private String city;

    private String district;

    @Column(name = "state_province")
    private String stateProvince;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(nullable = false)
    private String country;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(name = "is_default_shipping", nullable = false)
    private boolean isDefaultShipping;

    @Column(name = "is_default_billing", nullable = false)
    private boolean isDefaultBilling;

    @PrePersist
    protected void onCreate() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
        if (country == null) country = "Sri Lanka";
        if (countryCode == null) countryCode = "LK";
    }
}
