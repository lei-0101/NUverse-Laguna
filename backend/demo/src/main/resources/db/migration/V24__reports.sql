-- User-submitted reports visible to admin
CREATE TABLE IF NOT EXISTS reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject     VARCHAR(200) NOT NULL,
    category    VARCHAR(50)  NOT NULL DEFAULT 'OTHER',
    description TEXT         NOT NULL,
    target_type VARCHAR(50),
    target_id   UUID,
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
