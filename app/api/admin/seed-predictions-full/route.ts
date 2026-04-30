import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Supabase SQL (run once manually):
// CREATE TABLE IF NOT EXISTS predictions_full (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   round INT NOT NULL, season INT NOT NULL DEFAULT 2026, sport TEXT NOT NULL DEFAULT 'AFL',
//   player TEXT NOT NULL, team TEXT NOT NULL, opponent TEXT NOT NULL,
//   position TEXT, effective_position TEXT, bookie_line NUMERIC, predicted_line NUMERIC,
//   edge NUMERIC, signal TEXT, confidence TEXT, enhanced_signal TEXT,
//   edge_vol_score NUMERIC, est_std_dev NUMERIC, pos_threshold NUMERIC, bet_score NUMERIC,
//   pred_tog NUMERIC, avg_2025 NUMERIC, avg_2026 NUMERIC, blended_avg NUMERIC,
//   opp_factor NUMERIC, tog_rate NUMERIC, cba_adj NUMERIC, style TEXT, conditions TEXT,
//   rules_boost NUMERIC, avail_boost NUMERIC, form_indicator TEXT, games INT, venue TEXT,
//   game_id TEXT, game_time TIMESTAMPTZ, last5_disposals NUMERIC, divergence_pct NUMERIC,
//   context_flag TEXT, sample_confidence INT, role_swap TEXT, avg_cba_pct NUMERIC,
//   created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(round, season, player, sport)
// );
// CREATE INDEX IF NOT EXISTS idx_predictions_full_round ON predictions_full(round, season, sport);
// CREATE INDEX IF NOT EXISTS idx_predictions_full_signal ON predictions_full(enhanced_signal);
// CREATE INDEX IF NOT EXISTS idx_predictions_full_edgevol ON predictions_full(edge_vol_score DESC);

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== 'Bearer sportsphereadmin2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { round: number; season?: number; predictions: Record<string, unknown>[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { round, season = 2026, predictions } = body

  if (!round || !Array.isArray(predictions) || predictions.length === 0) {
    return NextResponse.json({ error: 'Missing round or predictions array' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const rows = predictions.map(p => ({
    ...p,
    round,
    season,
    sport: 'AFL',
    updated_at: new Date().toISOString(),
  }))

  const { error, count } = await admin
    .from('predictions_full')
    .upsert(rows, { onConflict: 'round,season,player,sport', count: 'exact' })

  if (error) {
    console.error('[seed-predictions-full] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[seed-predictions-full] upserted ${count ?? rows.length} rows for round ${round}`)
  return NextResponse.json({ success: true, upserted: count ?? rows.length, round, season })
}
