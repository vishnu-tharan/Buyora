-- ==============================================
-- V3: Inventory Domain
-- ==============================================

CREATE TABLE inventory_items (
    id                  BIGSERIAL PRIMARY KEY,
    variant_id          BIGINT NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_variant_id ON inventory_items(variant_id);

CREATE TABLE inventory_transactions (
    id              BIGSERIAL PRIMARY KEY,
    variant_id      BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN')),
    quantity        INTEGER NOT NULL,
    reference_id    VARCHAR(100), -- e.g., order_number, return_id
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255)
);

CREATE INDEX idx_inventory_txn_variant_id ON inventory_transactions(variant_id);
CREATE INDEX idx_inventory_txn_ref ON inventory_transactions(reference_id);
