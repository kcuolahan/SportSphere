-- SportSphere Fantasy Platform - Database Setup
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS fantasy_leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  commissioner_email TEXT NOT NULL,
  sports TEXT[] DEFAULT ARRAY['AFL'],
  season INT DEFAULT 2026,
  league_type TEXT DEFAULT 'season_long',
  scoring TEXT DEFAULT 'xp',
  max_teams INT DEFAULT 12,
  draft_date TIMESTAMPTZ,
  status TEXT DEFAULT 'setup',
  invite_code TEXT UNIQUE DEFAULT upper(substring(md5(random()::text), 1, 6)),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fantasy_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  team_name TEXT NOT NULL,
  total_xp INT DEFAULT 0,
  afl_xp INT DEFAULT 0,
  nba_xp INT DEFAULT 0,
  nfl_xp INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  streak INT DEFAULT 0,
  rank INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fantasy_rosters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_team TEXT NOT NULL,
  position TEXT NOT NULL,
  sport TEXT DEFAULT 'AFL',
  is_captain BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  draft_round INT,
  draft_pick INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fantasy_xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  sport TEXT DEFAULT 'AFL',
  round_number INT NOT NULL,
  event_type TEXT NOT NULL,
  xp_earned INT NOT NULL,
  stat_value NUMERIC,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fantasy_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES fantasy_leagues(id),
  from_team_id UUID REFERENCES fantasy_teams(id),
  to_team_id UUID REFERENCES fantasy_teams(id),
  player_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fantasy_scoring_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,
  stat_name TEXT NOT NULL,
  threshold NUMERIC NOT NULL,
  xp_value INT NOT NULL,
  description TEXT,
  is_bonus BOOLEAN DEFAULT false
);

INSERT INTO fantasy_scoring_rules (sport, stat_name, threshold, xp_value, description) VALUES
  ('AFL', 'disposals', 15, 2, '15+ disposals'),
  ('AFL', 'disposals', 20, 5, '20+ disposals'),
  ('AFL', 'disposals', 25, 10, '25+ disposals'),
  ('AFL', 'disposals', 30, 20, '30+ disposals'),
  ('AFL', 'disposals', 35, 35, '35+ disposals'),
  ('AFL', 'disposals', 40, 55, '40+ disposals'),
  ('AFL', 'disposals', 45, 80, '45+ disposals'),
  ('AFL', 'model_beat', 0.5, 10, 'Beat SportSphere line by 0.5+', true)
ON CONFLICT DO NOTHING;

INSERT INTO fantasy_scoring_rules (sport, stat_name, threshold, xp_value, description) VALUES
  ('NBA', 'points', 10, 3, '10+ points'),
  ('NBA', 'points', 20, 8, '20+ points'),
  ('NBA', 'points', 30, 18, '30+ points'),
  ('NBA', 'points', 40, 35, '40+ points'),
  ('NBA', 'assists', 5, 5, '5+ assists'),
  ('NBA', 'assists', 10, 15, '10+ assists'),
  ('NBA', 'rebounds', 8, 5, '8+ rebounds'),
  ('NBA', 'rebounds', 12, 15, '12+ rebounds'),
  ('NBA', 'triple_double', 1, 25, 'Triple double', true)
ON CONFLICT DO NOTHING;

INSERT INTO fantasy_scoring_rules (sport, stat_name, threshold, xp_value, description) VALUES
  ('NFL', 'receiving_yards', 50, 5, '50+ receiving yards'),
  ('NFL', 'receiving_yards', 100, 15, '100+ receiving yards'),
  ('NFL', 'receiving_yards', 150, 30, '150+ receiving yards'),
  ('NFL', 'rushing_yards', 50, 5, '50+ rushing yards'),
  ('NFL', 'rushing_yards', 100, 15, '100+ rushing yards'),
  ('NFL', 'passing_yards', 200, 8, '200+ passing yards'),
  ('NFL', 'passing_yards', 300, 20, '300+ passing yards'),
  ('NFL', 'touchdown', 1, 20, 'Touchdown scored', true)
ON CONFLICT DO NOTHING;
