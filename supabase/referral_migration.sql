-- Add referral columns to user_profiles
-- Run this in Supabase SQL editor

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by TEXT,
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code
  ON user_profiles (referral_code)
  WHERE referral_code IS NOT NULL;
