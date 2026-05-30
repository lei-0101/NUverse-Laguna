-- suggestion_votes has created_at but not updated_at — BaseEntity requires both
ALTER TABLE suggestion_votes
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
