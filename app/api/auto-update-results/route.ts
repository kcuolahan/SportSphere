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
    return { updated: 0, errors: 0, totalChecked: 0 }
  }

  let updatedCount = 0
  let errorCount = 0

  for (const pick of picks) {
    try {
      console.log(`[Auto-Update] Processing ${pick.player_name} (${pick.team})...`)

      const disposals = await getPlayerDisposals(pick.player_name, pick.team, pick.round)

      if (disposals === null) {
        console.log(`[Auto-Update] No data yet for ${pick.player_name}`)
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

  return { updated: updatedCount, errors: errorCount, totalChecked: picks.length }
}

export async function POST() {
  try {
    console.log('[Auto-Update] Starting Supabase results update...', new Date().toISOString())
    const { updated, errors, totalChecked } = await runUpdate()
    console.log(`[Auto-Update] Completed: ${updated} updated, ${errors} errors`)
    return Response.json({
      status: 'success',
      updated,
      errors,
      totalChecked,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Auto-Update] Fatal error:', error)
    return Response.json(
      { status: 'error', error: String(error), timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
