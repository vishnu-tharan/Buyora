-- ==============================================
-- V6: Payment Domain
-- ==============================================

CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    amount              NUMERIC(19,4) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'LKR',
    payment_method      VARCHAR(50) NOT NULL, -- PAYHERE, STRIPE, CASH_ON_DELIVERY
    
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'REFUNDED')),
    
    provider_payment_id VARCHAR(255), -- external transaction ID
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
