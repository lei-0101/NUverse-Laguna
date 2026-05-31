-- Add image_url column to emergency_announcements
ALTER TABLE emergency_announcements
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(512) NULL;

-- Announcement reactions table
CREATE TABLE IF NOT EXISTS announcement_reactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES emergency_announcements(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    emoji       VARCHAR(10) NOT NULL DEFAULT '👍',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ann_reactions_ann_id ON announcement_reactions(announcement_id);
CREATE INDEX IF NOT EXISTS idx_ann_reactions_user_id ON announcement_reactions(user_id);
