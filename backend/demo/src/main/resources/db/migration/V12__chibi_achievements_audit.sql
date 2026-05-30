-- Add audit columns to chibi_achievements to align with BaseEntity (created_at, updated_at)
ALTER TABLE chibi_achievements
    ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();
