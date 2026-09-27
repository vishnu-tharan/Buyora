-- ==============================================
-- V1: Initial Schema - Users, Roles, Sessions
-- Buyora E-Commerce Platform
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pg_trgm extension for full-text search later
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- ROLES
-- =====================
CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed base roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_CUSTOMER', 'Registered customer'),
    ('ROLE_ADMIN', 'System administrator'),
    ('ROLE_CATALOG_MANAGER', 'Manages products, categories, brands'),
    ('ROLE_ORDER_MANAGER', 'Manages orders and fulfillment'),
    ('ROLE_SUPPORT', 'Customer support access');

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    public_id       UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_public_id ON users (public_id);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_created_at ON users (created_at);

-- =====================
-- USER_ROLES (Junction)
-- =====================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);

-- =====================
-- REFRESH TOKENS
-- =====================
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

-- =====================
-- EMAIL VERIFICATION TOKENS
-- =====================
CREATE TABLE email_verification_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    used_at     TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verify_user_id ON email_verification_tokens (user_id);

-- =====================
-- PASSWORD RESET TOKENS
-- =====================
CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    used_at     TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwd_reset_user_id ON password_reset_tokens (user_id);

-- =====================
-- ADDRESSES
-- =====================
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

-- =====================
-- AUDIT LOG
-- =====================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    actor_id        BIGINT,          -- user performing action (null = system)
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
