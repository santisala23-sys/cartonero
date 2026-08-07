-- Cartonero save table (Neon / Postgres)
-- Run via: npm run db:push  (requires DATABASE_URL)

CREATE TABLE IF NOT EXISTS game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_key TEXT NOT NULL UNIQUE,
  state JSONB NOT NULL,
  mes INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_saves_updated_at_idx ON game_saves (updated_at DESC);
