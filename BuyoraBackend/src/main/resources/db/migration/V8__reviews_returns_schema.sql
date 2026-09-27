CREATE TABLE reviews (
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
