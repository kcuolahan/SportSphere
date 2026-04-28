import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const R8_PICKS = [
  // HC tier
  { player_name: 'Tristan Xerri',      team: 'NTH',  position: 'RUCK', line: 22.5, prediction: 'UNDER', edge_vol: 0.913, tier: 'HC', odds: 1.87, is_free_pick: true  },
  { player_name: 'Mattaes Phillipou',  team: 'STK',  position: 'MID',  line: 16.5, prediction: 'UNDER', edge_vol: 1.516, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Nick Daicos',        team: 'COL',  position: 'MID',  line: 30.5, prediction: 'OVER',  edge_vol: 1.330, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Elliot Yeo',         team: 'WCE',  position: 'MID',  line: 21.5, prediction: 'UNDER', edge_vol: 1.227, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Callum Wilkie',      team: 'STK',  position: 'DEF',  line: 23.5, prediction: 'OVER',  edge_vol: 1.216, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Ollie Wines',        team: 'PTA',  position: 'MID',  line: 25.5, prediction: 'UNDER', edge_vol: 1.017, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Luke Jackson',       team: 'FRE',  position: 'RUCK', line: 21.5, prediction: 'UNDER', edge_vol: 0.924, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Jordan De Goey',     team: 'COL',  position: 'MID',  line: 17.5, prediction: 'UNDER', edge_vol: 0.910, tier: 'HC', odds: 1.87, is_free_pick: false },
  { player_name: 'Matt Rowell',        team: 'GCS',  position: 'MID',  line: 28.5, prediction: 'UNDER', edge_vol: 0.621, tier: 'HC', odds: 1.87, is_free_pick: false },
  // BET tier
  { player_name: 'Josh Daicos',        team: 'COL',  position: 'MID',  line: 25.5, prediction: 'OVER',  edge_vol: 0.958, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Harris Andrews',     team: 'BRL',  position: 'DEF',  line: 16.5, prediction: 'OVER',  edge_vol: 0.801, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Tom Atkins',         team: 'GEE',  position: 'MID',  line: 20.5, prediction: 'UNDER', edge_vol: 0.728, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Jagga Smith',        team: 'CAR',  position: 'MID',  line: 20.5, prediction: 'OVER',  edge_vol: 0.619, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Ed Langdon',         team: 'MEL',  position: 'MID',  line: 21.5, prediction: 'UNDER', edge_vol: 0.619, tier: 'BET', odds: 1.87, is_free_pick: false },
  { player_name: 'Brodie Grundy',      team: 'SYD',  position: 'RUCK', line: 20.5, prediction: 'UNDER', edge_vol: 0.600, tier: 'BET', odds: 1.87, is_free_pick: false },
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

    // Insert R8 picks
    const rows = R8_PICKS.map(p => ({
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
      final_disposals: null,
      result: null,
      profit_loss: null,
    }))

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
