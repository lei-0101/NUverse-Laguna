-- Lost & Found items
-- Status: LOST | FOUND | RESOLVED
-- Category for item type

CREATE TABLE lost_found_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID          NOT NULL REFERENCES users(id),
    type        VARCHAR(10)   NOT NULL,   -- LOST | FOUND
    status      VARCHAR(15)   NOT NULL DEFAULT 'OPEN',  -- OPEN | RESOLVED
    title       VARCHAR(200)  NOT NULL,
    description TEXT          NOT NULL,
    location    VARCHAR(300)  NOT NULL,
    item_date   DATE          NOT NULL,
    image_url   VARCHAR(512),
    contact     VARCHAR(200)  NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lf_reporter ON lost_found_items (reporter_id);
CREATE INDEX idx_lf_status_type ON lost_found_items (status, type);
