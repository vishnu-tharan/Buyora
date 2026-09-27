-- ==============================================
-- V5: Order Domain
-- ==============================================

CREATE TABLE orders (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id             BIGINT, -- null for guest orders
    guest_email         VARCHAR(255),
    order_number        VARCHAR(50) NOT NULL UNIQUE,
    
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT'
                        CHECK (status IN ('PENDING_PAYMENT','PAYMENT_CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUNDED')),
    payment_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','AUTHORIZED','PAID','FAILED','REFUNDED')),
    payment_method      VARCHAR(50) NOT NULL,
    payment_id          VARCHAR(100), -- external payment gateway ID
    
    shipping_address_id BIGINT,
    -- snapshot of address in case the original address is deleted/changed
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
    price           NUMERIC(19,4) NOT NULL, -- snapshot of price at time of purchase
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
