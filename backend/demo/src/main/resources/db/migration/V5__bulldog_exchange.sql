CREATE TABLE merchandise_products
(
    id          UUID          NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(200)  NOT NULL,
    description VARCHAR(5000) NOT NULL,
    image_url   VARCHAR(512),
    category    VARCHAR(50)   NOT NULL,
    is_active   BOOLEAN       NOT NULL             DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL             DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_merchandise_products_category  ON merchandise_products (category);
CREATE INDEX idx_merchandise_products_is_active ON merchandise_products (is_active);

-- Full-text search on name + description for admin search
CREATE INDEX idx_merchandise_products_fts
    ON merchandise_products USING gin (to_tsvector('english', name || ' ' || description));

CREATE TABLE product_variants
(
    id         UUID           NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID           NOT NULL REFERENCES merchandise_products (id) ON DELETE CASCADE,
    size       VARCHAR(20),
    color      VARCHAR(50),
    sku        VARCHAR(100)   NOT NULL UNIQUE,
    stock      INT            NOT NULL CHECK (stock >= 0),
    price      NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP      NOT NULL             DEFAULT NOW(),
    updated_at TIMESTAMP      NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);

CREATE TABLE reservations
(
    id         UUID      NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    variant_id UUID      NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL           DEFAULT 'PENDING',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL             DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_reservations_student_id  ON reservations (student_id);
CREATE INDEX idx_reservations_variant_id  ON reservations (variant_id);
CREATE INDEX idx_reservations_status      ON reservations (status);
CREATE INDEX idx_reservations_expires_at  ON reservations (expires_at);
