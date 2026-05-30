-- chibi_xp_events has created_at but not updated_at — BaseEntity requires both
ALTER TABLE chibi_xp_events
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
