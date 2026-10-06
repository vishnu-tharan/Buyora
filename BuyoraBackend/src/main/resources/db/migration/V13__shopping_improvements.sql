CREATE TABLE store_settings(id INTEGER PRIMARY KEY CHECK(id=1),value JSONB NOT NULL);
-- Additive changes; existing orders and stock are preserved.
ALTER TABLE orders ADD COLUMN tracking_url VARCHAR(1000);
ALTER TABLE orders DROP CONSTRAINT orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK(payment_status IN ('PENDING','AUTHORIZED','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED'));
ALTER TABLE payments DROP CONSTRAINT payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK(status IN ('PENDING','AUTHORIZED','SUCCESS','FAILED','REFUNDED','PARTIALLY_REFUNDED'));
CREATE TABLE email_outbox (
 id BIGSERIAL PRIMARY KEY, recipient VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL, body TEXT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_error VARCHAR(100)
);
CREATE INDEX email_outbox_pending ON email_outbox(next_attempt_at) WHERE sent_at IS NULL;
CREATE TABLE product_alerts (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
 kind VARCHAR(20) NOT NULL CHECK(kind IN ('BACK_IN_STOCK','PRICE_DROP')), baseline_price NUMERIC(19,4) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), notified_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX product_alerts_active ON product_alerts(user_id,variant_id,kind) WHERE active;
CREATE TABLE return_items (
 return_id BIGINT NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
 order_item_id BIGINT NOT NULL REFERENCES order_items(id), PRIMARY KEY(return_id,order_item_id)
);
-- Historic requests were for entire orders.
INSERT INTO return_items(return_id,order_item_id) SELECT r.id,i.id FROM returns r JOIN order_items i ON i.order_id=r.order_id;
ALTER TABLE returns ADD COLUMN refund_reference VARCHAR(255);
ALTER TABLE returns ADD COLUMN refund_state VARCHAR(30) NOT NULL DEFAULT 'NOT_REQUESTED';
UPDATE returns SET refund_state='CONFIRMED' WHERE status='REFUNDED';
CREATE UNIQUE INDEX unique_confirmed_refund_reference ON returns(refund_reference) WHERE refund_state='CONFIRMED' AND refund_reference IS NOT NULL;
CREATE TABLE refund_resolution_audit(id BIGSERIAL PRIMARY KEY,return_id BIGINT NOT NULL REFERENCES returns(id),actor_id BIGINT NOT NULL REFERENCES users(id),reference VARCHAR(255) NOT NULL,evidence TEXT NOT NULL,amount NUMERIC(19,4) NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE analytics_daily (
 day DATE NOT NULL DEFAULT CURRENT_DATE, event VARCHAR(40) NOT NULL, count BIGINT NOT NULL DEFAULT 0,
 PRIMARY KEY(day,event)
);
CREATE TABLE payment_reconciliation (
 order_id BIGINT PRIMARY KEY REFERENCES orders(id), state VARCHAR(30) NOT NULL DEFAULT 'NEEDS_REVIEW',
 checked_at TIMESTAMPTZ, note VARCHAR(255), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE product_complements (
 product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 complement_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 CHECK(product_id<>complement_id), PRIMARY KEY(product_id,complement_id)
);
CREATE TABLE media_assets (id UUID PRIMARY KEY, content_type VARCHAR(50) NOT NULL, content BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE media_assets ADD COLUMN owner_id BIGINT REFERENCES users(id);
ALTER TABLE media_assets ADD COLUMN public_asset BOOLEAN NOT NULL DEFAULT TRUE;
CREATE TABLE review_photos(review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,asset_id UUID NOT NULL REFERENCES media_assets(id),PRIMARY KEY(review_id,asset_id));
ALTER TABLE products ADD COLUMN video_url VARCHAR(1000);
CREATE INDEX idx_products_name_trgm ON products USING gin (lower(name) gin_trgm_ops);
