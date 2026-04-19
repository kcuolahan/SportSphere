/**
 * POST /api/sync-round
 * Fetches current round data, runs the six-factor model, upserts into Supabase.
 *
 * Scaffold — Supabase client and live AFL API not yet wired.
 * Cron: runs every Tuesday 08:00 AEST (UTC+10) via Vercel Cron:
 *   vercel.json → { "crons": [{ "path": "/api/sync-round", "schedule": "0 22 * * 1" }] }
 *
 * TODO:
 *   1. Install @supabase/supabase-js and add SUPABASE_URL + SUPABASE_SERVICE_KEY env vars
 *   2. Create Supabase tables (see schema below)
 *   3. Uncomment Supabase upsert lines
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentRoundFixtures, fetchPlayerSeasonStats } from "@/lib/afl-api";
import { DEFAULT_WEIGHTS, simulatePick } from "@/lib/model-engine";

/*
── Supabase Schema ──────────────────────────────────────────────────────────
create table players (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  team text not null,
  position text not null,
  afl_id text,
  image_url text,
  updated_at timestamptz default now()
);

create table picks (
  id uuid primary key default gen_random_uuid(),
  round int not null,
  season int not null,
  player_id uuid references players(id),
  line numeric(5,1),
  model numeric(5,1),
  edge numeric(5,1),
  ev numeric(6,3),
  tier text,
  direction text,
  result text,
  actual_disposals numeric(5,1),
  created_at timestamptz default now(),
  unique (round, season, player_id)
);

create table weights_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  config_json jsonb not null,
  performance_json jsonb,
  created_at timestamptz default now()
);

create view track_record as
  select p.*, pl.name as player_name, pl.team, pl.position
  from picks p
  join players pl on pl.id = p.player_id
  where p.result is not null;
────────────────────────────────────────────────────────────────────────────
*/

export const runtime = "nodejs";

interface SyncResult {
  picksGenerated: number;
  newPlayers: number;
  updated: number;
  round: number;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<SyncResult>> {
  // Verify cron secret (set CRON_SECRET env var, pass as Authorization header)
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ picksGenerated: 0, newPlayers: 0, updated: 0, round: 0, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch current round fixtures
    const fixtures = await fetchCurrentRoundFixtures();
    if (!fixtures.length) {
      return NextResponse.json({ picksGenerated: 0, newPlayers: 0, updated: 0, round: 0, error: "No fixtures found" });
    }
    const round = fixtures[0].round;

    // 2. TODO: For each player with a disposal line available (from TAB / Sportsbet API),
    //    fetch their season stats and run simulatePick() with DEFAULT_WEIGHTS.
    //
    //    const stats = await fetchPlayerSeasonStats(playerAflId)
    //    const result = simulatePick({
    //      avg_2025: stats.avgDisposals, // prior season
    //      avg_2026: stats.avgDisposals,
    //      opp_adjustment_factor: dvpData.vsLeagueAvg,
    //      tog_rate: stats.togPct,
    //      team_style_index: 0,
    //      cba_pct: stats.cbaPct,
    //      league_avg_cba: 0.35,
    //      play_style: 'TRANS', // derive from scout data
    //      condition: 'Dry',    // from BOM weather API
    //      expected_tog: stats.togPct,
    //      rules_boost: 1.02,
    //      current_round: round,
    //      std_dev: 5.5,        // from historical std dev
    //    }, 'MID', bookieLine, DEFAULT_WEIGHTS)

    // 3. TODO: Upsert into Supabase
    //    const { data, error } = await supabase
    //      .from('picks')
    //      .upsert([{ round, season: 2026, player_id, line, model: result.predicted, ... }],
    //              { onConflict: 'round,season,player_id' })

    // Scaffold response
    return NextResponse.json({
      picksGenerated: 0,
      newPlayers: 0,
      updated: 0,
      round,
    });
  } catch (err) {
    console.error("[sync-round]", err);
    return NextResponse.json(
      { picksGenerated: 0, newPlayers: 0, updated: 0, round: 0, error: String(err) },
      { status: 500 }
    );
  }
}

// Allow GET for manual trigger during dev
export async function GET(req: NextRequest): Promise<NextResponse> {
  return POST(req);
}
