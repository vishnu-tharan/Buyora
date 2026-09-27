-- ==============================================
-- V4: Cart, Wishlist, Coupon Domain
-- ==============================================

CREATE TABLE coupons (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(50) NOT NULL UNIQUE,
    type                VARCHAR(30) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING')),
    value               NUMERIC(19,4) NOT NULL CHECK (value >= 0),
    min_purchase_amount NUMERIC(19,4) DEFAULT 0,
    max_discount_amount NUMERIC(19,4),
    valid_from          TIMESTAMP WITH TIME ZONE,
    valid_to            TIMESTAMP WITH TIME ZONE,
    usage_limit         INTEGER,
    used_count          INTEGER NOT NULL DEFAULT 0,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE wishlists (
    id          BIGSERIAL PRIMARY KEY,
    public_id   UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE wishlist_items (
    id          BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

CREATE TABLE carts (
    id          BIGSERIAL PRIMARY KEY,
    public_id   UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id     BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    guest_id    VARCHAR(100) UNIQUE, -- identifier stored in a guest cookie
    coupon_id   BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)
);

CREATE TABLE cart_items (
    id          BIGSERIAL PRIMARY KEY,
    cart_id     BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id  BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, variant_id)
);
