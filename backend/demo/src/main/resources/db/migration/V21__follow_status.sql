-- Add follow status for private profile approval flow
ALTER TABLE follows
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED';

CREATE INDEX IF NOT EXISTS idx_follows_following_status ON follows (following_id, status);
