-- ============================================================
-- SportSphere HQ — Supabase Setup SQL
-- Run this in the Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- 1. Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id                   SERIAL PRIMARY KEY,
  round_number         INT NOT NULL UNIQUE,
  season               INT NOT NULL DEFAULT 2026,
  sport                TEXT NOT NULL DEFAULT 'AFL',
  status               TEXT NOT NULL DEFAULT 'upcoming',
  -- status: upcoming | active | completed
  picks_seeded_at      TIMESTAMPTZ,
  picks_alert_sent_at  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Round 8 as active
INSERT INTO rounds (round_number, season, sport, status)
VALUES (8, 2026, 'AFL', 'active')
ON CONFLICT (round_number) DO NOTHING;

-- 2. Extend live_picks with sport/season columns
ALTER TABLE live_picks ADD COLUMN IF NOT EXISTS sport   TEXT DEFAULT 'AFL';
ALTER TABLE live_picks ADD COLUMN IF NOT EXISTS season  INT  DEFAULT 2026;

-- 3. HC stats view
CREATE OR REPLACE VIEW hc_stats AS
SELECT
  sport,
  season,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result IS NOT NULL) AS total_hc_picks,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result = 'WIN')     AS wins,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result = 'LOSS')    AS losses,
  ROUND(
    COUNT(*) FILTER (WHERE tier = 'HC' AND result = 'WIN')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE tier = 'HC' AND result IS NOT NULL), 0) * 100, 1
  )                                                                    AS win_rate_pct,
  COALESCE(SUM(profit_loss) FILTER (WHERE tier = 'HC'), 0)           AS gross_pl,
  ROUND(
    COALESCE(SUM(profit_loss) FILTER (WHERE tier = 'HC'), 0) /
    NULLIF(COUNT(*) FILTER (WHERE tier = 'HC' AND result IS NOT NULL) * 1000, 0) * 100, 1
  )                                                                    AS roi_pct,
  MAX(round)                                                          AS latest_round
FROM live_picks
GROUP BY sport, season;

-- 4. Round stats view
CREATE OR REPLACE VIEW round_stats AS
SELECT
  sport,
  season,
  round,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result IS NOT NULL) AS picks,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result = 'WIN')     AS wins,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result = 'LOSS')    AS losses,
  ROUND(
    COUNT(*) FILTER (WHERE tier = 'HC' AND result = 'WIN')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE tier = 'HC' AND result IS NOT NULL), 0) * 100, 1
  )                                                                    AS win_rate_pct,
  COALESCE(SUM(profit_loss) FILTER (WHERE tier = 'HC'), 0)           AS net_pl
FROM live_picks
GROUP BY sport, season, round
ORDER BY round;

-- 5. Position stats view
CREATE OR REPLACE VIEW position_stats AS
SELECT
  sport,
  season,
  position,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result IS NOT NULL) AS picks,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result = 'WIN')     AS wins,
  COUNT(*)         FILTER (WHERE tier = 'HC' AND result = 'LOSS')    AS losses,
  ROUND(
    COUNT(*) FILTER (WHERE tier = 'HC' AND result = 'WIN')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE tier = 'HC' AND result IS NOT NULL), 0) * 100, 1
  )                                                                    AS win_rate_pct
FROM live_picks
WHERE position IN ('MID', 'DEF', 'FWD', 'RUCK')
GROUP BY sport, season, position;

-- ============================================================
-- Done. You can now call /api/stats?sport=AFL&season=2026
-- ============================================================
