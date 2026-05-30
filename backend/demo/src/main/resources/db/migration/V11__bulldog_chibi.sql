-- Bulldog Chibi XP system

CREATE TABLE chibi_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL UNIQUE REFERENCES users(id),
    xp              INTEGER NOT NULL DEFAULT 0,
    level           INTEGER NOT NULL DEFAULT 1,
    title           VARCHAR(100),          -- Currently equipped title
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chibi_xp_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id),
    source      VARCHAR(50)  NOT NULL,   -- XP source type
    xp_gained   INTEGER      NOT NULL,
    description VARCHAR(200),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE chibi_achievements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id),
    achievement VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, achievement)
);

CREATE INDEX idx_chibi_user ON chibi_profiles (user_id);
CREATE INDEX idx_chibi_xp_events_user ON chibi_xp_events (user_id);
CREATE INDEX idx_chibi_achievements_user ON chibi_achievements (user_id);
