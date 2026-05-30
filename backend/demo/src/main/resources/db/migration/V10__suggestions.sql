-- Suggestions & Feedback (ProductHunt-style upvoting)

CREATE TABLE suggestions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id   UUID          NOT NULL REFERENCES users(id),
    title       VARCHAR(200)  NOT NULL,
    description TEXT          NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'OPEN',  -- OPEN | UNDER_REVIEW | ACCEPTED | DECLINED | DONE
    vote_count  INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE suggestion_votes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (suggestion_id, user_id)
);

CREATE INDEX idx_suggestions_status ON suggestions (status);
CREATE INDEX idx_suggestions_votes ON suggestions (vote_count DESC);
CREATE INDEX idx_suggestion_votes_user ON suggestion_votes (user_id);
