-- Enhanced suspension: duration, count, reason
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS suspended_until  TIMESTAMP,
    ADD COLUMN IF NOT EXISTS suspend_count    INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR(500);
