-- ==============================================
-- V2: Catalog Domain - Categories, Brands, Products
-- ==============================================

-- =====================
-- CATEGORIES (hierarchical, tree structure)
-- =====================
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
    path            VARCHAR(1000),  -- materialized path e.g. "/1/5/12/"
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

-- =====================
-- BRANDS
-- =====================
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

-- =====================
-- ATTRIBUTE DEFINITIONS
-- =====================
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

-- =====================
-- PRODUCTS
-- =====================
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
-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(short_description,''))
);
-- Tags index
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- =====================
-- PRODUCT VARIANTS
-- =====================
CREATE TABLE product_variants (
    id                  BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku                 VARCHAR(100) NOT NULL UNIQUE,
    price               NUMERIC(19,4) NOT NULL CHECK (price >= 0),
    compare_at_price    NUMERIC(19,4) CHECK (compare_at_price >= 0),
    cost_price          NUMERIC(19,4) CHECK (cost_price >= 0),  -- admin only, never expose publicly
    weight_grams        INTEGER,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);
CREATE INDEX idx_variants_active ON product_variants (active);

-- =====================
-- VARIANT ATTRIBUTES (links variants to attribute values)
-- =====================
CREATE TABLE variant_attributes (
    id                      BIGSERIAL PRIMARY KEY,
    variant_id              BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_definition_id BIGINT NOT NULL REFERENCES attribute_definitions(id),
    value                   VARCHAR(500) NOT NULL,
    display_value           VARCHAR(500),
    color_code              VARCHAR(20),  -- hex color for color swatches
    UNIQUE (variant_id, attribute_definition_id)
);

CREATE INDEX idx_variant_attrs_variant_id ON variant_attributes (variant_id);

-- =====================
-- PRODUCT IMAGES
-- =====================
CREATE TABLE product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id  BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    url         VARCHAR(1000) NOT NULL,
    storage_key VARCHAR(500),  -- object storage key
    alt_text    VARCHAR(300),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_variant_id ON product_images (variant_id);
CREATE INDEX idx_product_images_primary ON product_images (product_id, is_primary);
