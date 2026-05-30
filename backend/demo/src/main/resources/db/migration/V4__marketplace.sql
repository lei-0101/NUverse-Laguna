CREATE TABLE marketplace_listings
(
    id          UUID           NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id   UUID           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title       VARCHAR(200)   NOT NULL,
    description VARCHAR(5000)  NOT NULL,
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category    VARCHAR(50)    NOT NULL,
    condition   VARCHAR(20)    NOT NULL,
    status      VARCHAR(20)    NOT NULL             DEFAULT 'AVAILABLE',
    created_at  TIMESTAMP      NOT NULL             DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_marketplace_listings_seller_id ON marketplace_listings (seller_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings (status);
CREATE INDEX idx_marketplace_listings_category ON marketplace_listings (category);
CREATE INDEX idx_marketplace_listings_price ON marketplace_listings (price);

-- Full-text search index for keyword filtering on title and description
CREATE INDEX idx_marketplace_listings_fts
    ON marketplace_listings USING gin (to_tsvector('english', title || ' ' || description));

CREATE TABLE listing_images
(
    id            UUID         NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id    UUID         NOT NULL REFERENCES marketplace_listings (id) ON DELETE CASCADE,
    image_url     VARCHAR(512) NOT NULL,
    display_order INT          NOT NULL             DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL             DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing_id ON listing_images (listing_id);

CREATE TABLE saved_listings
(
    id         UUID      NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    listing_id UUID      NOT NULL REFERENCES marketplace_listings (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL             DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL             DEFAULT NOW(),
    CONSTRAINT uq_saved_listings_user_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_saved_listings_user_id ON saved_listings (user_id);
CREATE INDEX idx_saved_listings_listing_id ON saved_listings (listing_id);

CREATE TABLE listing_reports
(
    id          UUID         NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    listing_id  UUID         NOT NULL REFERENCES marketplace_listings (id) ON DELETE CASCADE,
    reason      VARCHAR(500) NOT NULL,
    status      VARCHAR(20)  NOT NULL             DEFAULT 'PENDING',
    created_at  TIMESTAMP    NOT NULL             DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_listing_reports_listing_id ON listing_reports (listing_id);
CREATE INDEX idx_listing_reports_status ON listing_reports (status);
