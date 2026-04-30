import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// SQL to run once in Supabase to add game columns:
// ALTER TABLE live_picks ADD COLUMN IF NOT EXISTS game_time TIMESTAMPTZ;
// ALTER TABLE live_picks ADD COLUMN IF NOT EXISTS game_id TEXT;

// Keys are alphabetically sorted team codes (same as getGameKey output)
const ROUND_8_FIXTURES: Record<string, { time: string; venue: string }> = {
  'COL_HAW': { time: '2026-05-01T11:50:00Z', venue: 'MCG' },
  'ADE_PTA': { time: '2026-05-02T07:35:00Z', venue: 'Adelaide Oval' },
  'FRE_WBD': { time: '2026-05-02T09:40:00Z', venue: 'Marvel Stadium' },
  'GEE_NTH': { time: '2026-05-02T03:35:00Z', venue: 'GMHBA Stadium' },
  'CAR_STK': { time: '2026-05-02T10:20:00Z', venue: 'Marvel Stadium' },
  'RIC_WCE': { time: '2026-05-03T07:10:00Z', venue: 'Optus Stadium' },
  'GCS_GWS': { time: '2026-05-03T03:35:00Z', venue: 'People First Stadium' },
  'BRL_ESS': { time: '2026-05-03T11:15:00Z', venue: 'The Gabba' },
  'MEL_SYD': { time: '2026-05-03T09:00:00Z', venue: 'SCG' },
}

function getGameKey(team: string, opponent: string): string {
  return [team, opponent].sort().join('_')
}

const R8_PICKS = [
  // HC tier
  { player_name: 'Tristan Xerri',      team: 'NTH',  opponent: 'GEE',  position: 'RUCK', line: 22.5, prediction: 'UNDER', edge_vol: 0.913, tier: 'HC',  odds: 1.87, is_free_pick: true  },
  { player_name: 'Mattaes Phillipou',  team: 'STK',  opponent: 'CAR',  position: 'MID',  line: 16.5, prediction: 'UNDER', edge_vol: 1.516, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Nick Daicos',        team: 'COL',  opponent: 'HAW',  position: 'MID',  line: 30.5, prediction: 'OVER',  edge_vol: 1.330, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Elliot Yeo',         team: 'WCE',  opponent: 'RIC',  position: 'MID',  line: 21.5, prediction: 'UNDER', edge_vol: 1.227, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Callum Wilkie',      team: 'STK',  opponent: 'CAR',  position: 'DEF',  line: 23.5, prediction: 'OVER',  edge_vol: 1.216, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Ollie Wines',        team: 'PTA',  opponent: 'ADE',  position: 'MID',  line: 25.5, prediction: 'UNDER', edge_vol: 1.017, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Luke Jackson',       team: 'FRE',  opponent: 'WBD',  position: 'RUCK', line: 21.5, prediction: 'UNDER', edge_vol: 0.924, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Jordan De Goey',     team: 'COL',  opponent: 'HAW',  position: 'MID',  line: 17.5, prediction: 'UNDER', edge_vol: 0.910, tier: 'HC',  odds: 1.87, is_free_pick: false },
  { player_name: 'Matt Rowell',        team: 'GCS',  opponent: 'GWS',  position: 'MID',  line: 28.5, prediction: 'UNDER', edge_vol: 0.621, tier: 'HC',  odds: 1.87, is_free_pick: false },
  // BET tier
  { player_name: 'Josh Daicos',        team: 'COL',  opponent: 'HAW',  position: 'MID',  line: 25.5, prediction: 'OVER',  edge_vol: 0.958, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Harris Andrews',     team: 'BRL',  opponent: 'ESS',  position: 'DEF',  line: 16.5, prediction: 'OVER',  edge_vol: 0.801, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Tom Atkins',         team: 'GEE',  opponent: 'NTH',  position: 'MID',  line: 20.5, prediction: 'UNDER', edge_vol: 0.728, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Jagga Smith',        team: 'CAR',  opponent: 'STK',  position: 'MID',  line: 20.5, prediction: 'OVER',  edge_vol: 0.619, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Ed Langdon',         team: 'MEL',  opponent: 'SYD',  position: 'MID',  line: 21.5, prediction: 'UNDER', edge_vol: 0.619, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Brodie Grundy',      team: 'SYD',  opponent: 'MEL',  position: 'RUCK', line: 20.5, prediction: 'UNDER', edge_vol: 0.600, tier: 'BET', odds: 1.87, is_free_pick: false },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== 'sportsphereadmin2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Delete existing R8 picks
    const { error: deleteError } = await admin
      .from('live_picks')
      .delete()
      .eq('round', 8)

    if (deleteError) {
      console.error('[seed-r8] delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Insert R8 picks with game metadata
    const rows = R8_PICKS.map(p => {
      const gameKey = getGameKey(p.team, p.opponent)
      const fixture = ROUND_8_FIXTURES[gameKey]
      return {
        round: 8,
        player_name: p.player_name,
        team: p.team,
        position: p.position,
        line: p.line,
        prediction: p.prediction,
        edge_vol: p.edge_vol,
        tier: p.tier,
        odds: p.odds,
        is_free_pick: p.is_free_pick,
        game_id: gameKey,
        game_time: fixture?.time ?? null,
        final_disposals: null,
        result: null,
        profit_loss: null,
      }
    })

    const { error: insertError } = await admin.from('live_picks').insert(rows)

    if (insertError) {
      console.error('[seed-r8] insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'success', seeded: rows.length, round: 8 })
  } catch (e) {
    console.error('[seed-r8] exception:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
