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
