import { readFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const picksPath = join(process.cwd(), 'public', 'data', 'live-picks.json')
    const picksFile = await readFile(picksPath, 'utf-8')
    const picksData = JSON.parse(picksFile)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const rows = picksData.picks.map((p: Record<string, unknown>) => ({
      round: picksData.round,
      player_name: p.playerName,
      team: p.team,
      position: p.position,
      line: p.line,
      prediction: p.prediction,
      edge_vol: p.edgeVol,
      tier: p.tier,
      odds: p.odds ?? 1.87,
      final_disposals: p.finalDisposals ?? null,
      result: p.result ?? null,
      profit_loss: p.profitLoss ?? null,
    }))

    const { error } = await supabase.from('live_picks').insert(rows)

    if (error) {
      return Response.json({ status: 'error', error: String(error) }, { status: 400 })
    }

    return Response.json({ status: 'success', migrated: rows.length })
  } catch (err) {
    return Response.json({ status: 'error', error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
