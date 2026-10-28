CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
    ('ROLE_CUSTOMER', 'Registered customer'),
    ('ROLE_ADMIN', 'System administrator');

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    public_id       UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_public_id ON users (public_id);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_created_at ON users (created_at);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at  TIMESTAMP WITH TIME ZONE,
    user_agent  VARCHAR(500),
    ip_address  VARCHAR(50),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

CREATE TABLE addresses (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id             BIGINT REFERENCES users(id) ON DELETE CASCADE,
    label               VARCHAR(50),
    recipient_name      VARCHAR(200) NOT NULL,
    phone               VARCHAR(30) NOT NULL,
    address_line1       VARCHAR(300) NOT NULL,
    address_line2       VARCHAR(300),
    city                VARCHAR(100) NOT NULL,
    district            VARCHAR(100),
    state_province      VARCHAR(100),
    postal_code         VARCHAR(20),
    country             VARCHAR(100) NOT NULL DEFAULT 'Sri Lanka',
    country_code        CHAR(2) NOT NULL DEFAULT 'LK',
    is_default_shipping BOOLEAN NOT NULL DEFAULT FALSE,
    is_default_billing  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);
CREATE INDEX idx_addresses_public_id ON addresses (public_id);

CREATE TABLE audit_logs (
    public_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    actor_public_id UUID,
    id              BIGSERIAL PRIMARY KEY,
    actor_id        BIGINT,
    actor_email     VARCHAR(255),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       VARCHAR(100),
    description     TEXT,
    metadata        JSONB,
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

CREATE TABLE categories (
    id              BIGSERIAL PRIMARY KEY,
    public_id       UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(1000),
    image_alt       VARCHAR(300),
    parent_id       BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    level           INTEGER NOT NULL DEFAULT 0,
    path            VARCHAR(1000),
    seo_title       VARCHAR(300),
    seo_description VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    CONSTRAINT chk_no_self_parent CHECK (id != parent_id)
);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_active ON categories (active);
CREATE INDEX idx_categories_sort_order ON categories (sort_order);

CREATE TABLE brands (
    id              BIGSERIAL PRIMARY KEY,
    public_id       UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name            VARCHAR(200) NOT NULL UNIQUE,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        VARCHAR(1000),
    logo_alt        VARCHAR(300),
    website_url     VARCHAR(500),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

CREATE INDEX idx_brands_slug ON brands (slug);
CREATE INDEX idx_brands_active ON brands (active);

CREATE TABLE attribute_definitions (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    type        VARCHAR(30) NOT NULL DEFAULT 'TEXT'
                    CHECK (type IN ('TEXT','COLOR','SIZE','BOOLEAN','NUMBER')),
    filterable  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO attribute_definitions (name, slug, type, filterable) VALUES
    ('Color', 'color', 'COLOR', TRUE),
    ('Size', 'size', 'SIZE', TRUE),
    ('Material', 'material', 'TEXT', TRUE),
    ('Weight', 'weight', 'NUMBER', FALSE);

CREATE TABLE products (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name                VARCHAR(500) NOT NULL,
    slug                VARCHAR(500) NOT NULL UNIQUE,
    short_description   VARCHAR(1000),
    description         TEXT,
    category_id         BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id            BIGINT REFERENCES brands(id) ON DELETE SET NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','ACTIVE','INACTIVE','ARCHIVED')),
    featured            BOOLEAN NOT NULL DEFAULT FALSE,
    new_arrival         BOOLEAN NOT NULL DEFAULT FALSE,
    best_seller         BOOLEAN NOT NULL DEFAULT FALSE,
    tags                TEXT[],
    seo_title           VARCHAR(300),
    seo_description     VARCHAR(500),
    average_rating      NUMERIC(3,2) DEFAULT 0,
    review_count        INTEGER NOT NULL DEFAULT 0,
    specifications      JSONB,
    shipping_info       TEXT,
    return_info         TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255)
);

CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_brand_id ON products (brand_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_featured ON products (featured) WHERE featured = TRUE;
CREATE INDEX idx_products_new_arrival ON products (new_arrival) WHERE new_arrival = TRUE;
CREATE INDEX idx_products_best_seller ON products (best_seller) WHERE best_seller = TRUE;
CREATE INDEX idx_products_created_at ON products (created_at DESC);

CREATE INDEX idx_products_tags ON products USING GIN (tags);

CREATE TABLE product_variants (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku                 VARCHAR(100) NOT NULL UNIQUE,
    price               NUMERIC(19,4) NOT NULL CHECK (price >= 0),
    compare_at_price    NUMERIC(19,4) CHECK (compare_at_price >= 0),
    cost_price          NUMERIC(19,4) CHECK (cost_price >= 0),
    weight_grams        INTEGER,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);
CREATE INDEX idx_variants_active ON product_variants (active);

CREATE TABLE variant_attributes (
    id                      BIGSERIAL PRIMARY KEY,
    variant_id              BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_definition_id BIGINT NOT NULL REFERENCES attribute_definitions(id),
    value                   VARCHAR(500) NOT NULL,
    display_value           VARCHAR(500),
    color_code              VARCHAR(20),
    UNIQUE (variant_id, attribute_definition_id)
);

CREATE INDEX idx_variant_attrs_variant_id ON variant_attributes (variant_id);

CREATE TABLE product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id  BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    url         VARCHAR(1000) NOT NULL,
    storage_key VARCHAR(500),
    alt_text    VARCHAR(300),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_variant_id ON product_images (variant_id);
CREATE INDEX idx_product_images_primary ON product_images (product_id, is_primary);

CREATE TABLE inventory_items (
    id                  BIGSERIAL PRIMARY KEY,
    variant_id          BIGINT NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0 AND reserved_quantity <= stock_quantity),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_variant_id ON inventory_items(variant_id);

CREATE TABLE inventory_transactions (
    id              BIGSERIAL PRIMARY KEY,
    variant_id      BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN', 'RESERVATION', 'RELEASE')),
    quantity        INTEGER NOT NULL,
    reference_id    VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255)
);

CREATE INDEX idx_inventory_txn_variant_id ON inventory_transactions(variant_id);
CREATE INDEX idx_inventory_txn_ref ON inventory_transactions(reference_id);

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
    guest_id    VARCHAR(100) UNIQUE,
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

CREATE TABLE orders (
    guest_cart_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    tracking_url VARCHAR(1000),
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id             BIGINT,
    guest_email         VARCHAR(255),
    order_number        VARCHAR(50) NOT NULL UNIQUE,

    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT'
                        CHECK (status IN ('PENDING_PAYMENT','PAYMENT_CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUNDED')),
    payment_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','AUTHORIZED','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
    payment_method      VARCHAR(50) NOT NULL,
    payment_id          VARCHAR(100),

    shipping_address_id BIGINT,

    shipping_snapshot   JSONB NOT NULL,

    subtotal            NUMERIC(19,4) NOT NULL,
    discount_amount     NUMERIC(19,4) NOT NULL DEFAULT 0,
    shipping_amount     NUMERIC(19,4) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(19,4) NOT NULL DEFAULT 0,
    total               NUMERIC(19,4) NOT NULL,

    coupon_code         VARCHAR(50),
    delivery_method     VARCHAR(50),
    estimated_delivery  TIMESTAMP WITH TIME ZONE,
    tracking_number     VARCHAR(100),
    customer_notes      TEXT,
    admin_notes         TEXT,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL,
    variant_id      BIGINT NOT NULL,

    sku             VARCHAR(100) NOT NULL,
    product_name    VARCHAR(500) NOT NULL,
    price           NUMERIC(19,4) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    total           NUMERIC(19,4) NOT NULL,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TABLE order_status_history (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status      VARCHAR(30) NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255)
);

CREATE INDEX idx_order_history_order_id ON order_status_history(order_id);

CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    amount              NUMERIC(19,4) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'LKR',
    payment_method      VARCHAR(50) NOT NULL,

    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),

    provider_payment_id VARCHAR(255),
    error_message       TEXT,

    metadata            JSONB,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_provider_id ON payments(provider_payment_id);

CREATE TABLE payment_webhooks (
    id              BIGSERIAL PRIMARY KEY,
    payment_id      BIGINT REFERENCES payments(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,
    event_type      VARCHAR(100),
    payload         JSONB NOT NULL,
    processed       BOOLEAN NOT NULL DEFAULT FALSE,
    error_message   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE shipping_methods (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    base_rate       NUMERIC(19,4) NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
INSERT INTO shipping_methods (name, base_rate) VALUES ('Standard Delivery', 350.00), ('Express Delivery', 750.00);

CREATE TABLE reviews (
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    id          BIGSERIAL PRIMARY KEY,
    public_id   UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200),
    comment     TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

CREATE TABLE returns (
    refund_reference VARCHAR(255),
    refund_state VARCHAR(30) NOT NULL DEFAULT 'NOT_REQUESTED',
    id              BIGSERIAL PRIMARY KEY,
    public_id       UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED')),
    reason          TEXT NOT NULL,
    refund_amount   NUMERIC(19,4) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX inventory_reservation_reference
    ON inventory_transactions(reference_id, variant_id, type)
    WHERE type IN ('RESERVATION', 'SALE', 'RELEASE') AND reference_id IS NOT NULL;
CREATE INDEX reviews_product_status_idx ON reviews(product_id, status, created_at DESC);
CREATE INDEX audit_logs_actor_public_id_idx ON audit_logs(actor_public_id);
CREATE UNIQUE INDEX unique_confirmed_refund_reference ON returns(refund_reference)
    WHERE refund_state='CONFIRMED' AND refund_reference IS NOT NULL;

CREATE TABLE store_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    value JSONB NOT NULL
);

CREATE TABLE return_items (
    return_id BIGINT NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id),
    PRIMARY KEY (return_id, order_item_id)
);

CREATE TABLE refund_resolution_audit (
    id BIGSERIAL PRIMARY KEY,
    return_id BIGINT NOT NULL REFERENCES returns(id),
    actor_id BIGINT NOT NULL REFERENCES users(id),
    reference VARCHAR(255) NOT NULL,
    evidence TEXT NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_reconciliation (
    order_id BIGINT PRIMARY KEY REFERENCES orders(id),
    state VARCHAR(30) NOT NULL DEFAULT 'NEEDS_REVIEW',
    checked_at TIMESTAMPTZ,
    note VARCHAR(255),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content BYTEA NOT NULL,
    owner_id BIGINT REFERENCES users(id),
    public_asset BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_photos (
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES media_assets(id),
    PRIMARY KEY (review_id, asset_id)
);
