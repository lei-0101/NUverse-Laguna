CREATE TABLE user_profiles
(
    id                        UUID         NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                   UUID         NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    full_name                 VARCHAR(100) NOT NULL,
    avatar_url                VARCHAR(512),
    bio                       VARCHAR(500),
    course                    VARCHAR(100),
    year_level                VARCHAR(20),
    interests                 VARCHAR(255),
    visibility                VARCHAR(20)  NOT NULL             DEFAULT 'PUBLIC',
    hide_marketplace_activity BOOLEAN      NOT NULL             DEFAULT FALSE,
    hide_chibi_showcase       BOOLEAN      NOT NULL             DEFAULT FALSE,
    created_at                TIMESTAMP    NOT NULL             DEFAULT NOW(),
    updated_at                TIMESTAMP    NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);

CREATE TABLE follows
(
    id           UUID      NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id  UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    following_id UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at   TIMESTAMP NOT NULL             DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL             DEFAULT NOW(),
    CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT ck_follows_no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_follows_following_id ON follows (following_id);
