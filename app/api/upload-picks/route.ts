import { createClient } from '@supabase/supabase-js'
import { parseEnhancedPicksFromFile, extractPrediction, extractEdgeVol } from '@/lib/excel-parser'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const roundRaw = formData.get('round') as string | null

    if (!file || !roundRaw) {
      return Response.json({ error: 'Missing file or round number' }, { status: 400 })
    }

    const round = parseInt(roundRaw, 10)
    if (isNaN(round) || round < 1 || round > 27) {
      return Response.json({ error: 'Invalid round number' }, { status: 400 })
    }

    const picks = await parseEnhancedPicksFromFile(file, round)

    if (picks.length === 0) {
      return Response.json(
        { error: 'No HC picks found — check that "Enhanced Picks" sheet exists and has HIGH CONVICTION rows' },
        { status: 400 },
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const pickRows = picks.map((pick) => ({
      round: pick.round,
      player_name: pick.playerName,
      team: pick.team,
      position: pick.pos,
      line: pick.line,
      prediction: extractPrediction(pick.direction),
      edge_vol: extractEdgeVol(pick.betScore),
      tier: 'HC',
      odds: 1.87,
      final_disposals: null,
      result: null,
      profit_loss: null,
    }))

    // Clear existing picks for this round, then insert fresh
    const { error: deleteError } = await supabase
      .from('live_picks')
      .delete()
      .eq('round', round)

    if (deleteError) {
      console.error('Delete error:', deleteError)
    }

    const { error: insertError } = await supabase.from('live_picks').insert(pickRows)

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return Response.json(
        { error: `Failed to insert picks: ${insertError.message}` },
        { status: 500 },
      )
    }

    return Response.json({
      status: 'success',
      message: `Seeded ${pickRows.length} HC picks for Round ${round}`,
      picksCount: pickRows.length,
      picks: pickRows,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
