import {
  getUnresolvedPicksFromSupabase,
  updatePickResultInSupabase,
  getPlayerDisposals,
  calculatePickResult,
} from '@/lib/squiggle'

export const runtime = 'nodejs'

async function runUpdate() {
  const picks = await getUnresolvedPicksFromSupabase()

  if (picks.length === 0) {
    console.log('[Auto-Update] No unresolved picks found')
    return { updated: 0, matched: 0, errors: 0, totalChecked: 0, pending: 0, unmatched: [] }
  }

  let updatedCount = 0
  let errorCount = 0
  const pendingPicks: { player: string; reason: string }[] = []

  for (const pick of picks) {
    try {
      console.log(`[Auto-Update] Processing ${pick.player_name} (${pick.team})...`)

      const disposals = await getPlayerDisposals(pick.player_name, pick.team, pick.round)

      if (disposals === null) {
        console.log(`[Auto-Update] No data yet for ${pick.player_name}`)
        pendingPicks.push({ player: pick.player_name, reason: 'No matching player found in Squiggle data' })
        continue
      }

      const resultData = calculatePickResult(
        pick.prediction,
        disposals,
        pick.line,
        pick.odds ?? 1.87,
      )

      const success = await updatePickResultInSupabase(
        pick.id,
        resultData.finalDisposals,
        resultData.result as 'WIN' | 'LOSS',
        resultData.profitLoss,
      )

      if (success) {
        updatedCount++
        console.log(`[Auto-Update] ✓ ${pick.player_name}: ${resultData.result} (${disposals} vs ${pick.line})`)
      } else {
        errorCount++
      }
    } catch (err) {
      errorCount++
      console.error(`[Auto-Update] Error processing ${pick.player_name}:`, err)
    }
  }

  return {
    updated: updatedCount,
    matched: updatedCount,
    errors: errorCount,
    totalChecked: picks.length,
    pending: pendingPicks.length,
    unmatched: pendingPicks,
  }
}

export async function POST() {
  try {
    console.log('[Auto-Update] Starting Supabase results update...', new Date().toISOString())
    const result = await runUpdate()
    console.log(`[Auto-Update] Completed: ${result.updated} updated, ${result.pending} pending, ${result.errors} errors`)
    return Response.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Auto-Update] Fatal error:', error)
    return Response.json(
      { success: false, status: 'error', error: String(error), timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
