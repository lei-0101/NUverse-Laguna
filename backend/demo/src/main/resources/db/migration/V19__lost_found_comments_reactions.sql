-- Comments on lost & found posts
CREATE TABLE IF NOT EXISTS lost_found_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id     UUID NOT NULL REFERENCES lost_found_items(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL,
    author_name VARCHAR(120) NOT NULL,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lf_comments_item_id ON lost_found_comments(item_id);

-- Reactions on lost & found posts (one per user per item)
CREATE TABLE IF NOT EXISTS lost_found_reactions (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES lost_found_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji   VARCHAR(10) NOT NULL DEFAULT '👍',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lf_reactions_item_id ON lost_found_reactions(item_id);
