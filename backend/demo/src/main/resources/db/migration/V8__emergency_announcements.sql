-- Emergency Announcements
-- Priority levels: GENERAL, IMPORTANT, CRITICAL
-- CRITICAL announcements show a site-wide fixed banner

CREATE TABLE emergency_announcements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200)  NOT NULL,
    body        TEXT          NOT NULL,
    priority    VARCHAR(20)   NOT NULL DEFAULT 'GENERAL',
    created_by  UUID          NOT NULL REFERENCES users(id),
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_active_priority ON emergency_announcements (active, priority);
CREATE INDEX idx_announcements_created_by ON emergency_announcements (created_by);
