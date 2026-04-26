import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { getPlayerDisposals, calculatePickResult } from '@/lib/squiggle'

export const runtime = 'nodejs'

async function runUpdate() {
  const picksPath = join(process.cwd(), 'public', 'data', 'live-picks.json')
  const picksFile = await readFile(picksPath, 'utf-8')
  const picksData = JSON.parse(picksFile)

  let updatedCount = 0
  let errorCount = 0

  for (const pick of picksData.picks) {
    if (pick.result) continue

    try {
      const disposals = await getPlayerDisposals(pick.playerName, pick.team, picksData.round)

      if (disposals !== null) {
        const resultData = calculatePickResult(
          pick.prediction,
          disposals,
          pick.line,
          pick.odds ?? 1.87,
        )

        pick.finalDisposals = resultData.finalDisposals
        pick.result = resultData.result
        pick.profitLoss = resultData.profitLoss
        pick.updatedAt = new Date().toISOString()

        updatedCount++
        console.log(`[Auto-Update] ${pick.playerName}: ${resultData.result} (${disposals} vs ${pick.line})`)
      }
    } catch (err) {
      errorCount++
      console.error(`[Auto-Update] Error processing ${pick.playerName}:`, err)
    }
  }

  await writeFile(picksPath, JSON.stringify(picksData, null, 2))
  console.log(`[Auto-Update] Completed: ${updatedCount} updated, ${errorCount} errors`)

  return { updated: updatedCount, errors: errorCount }
}

export async function POST() {
  try {
    console.log('[Auto-Update] Starting results update...', new Date().toISOString())
    const { updated, errors } = await runUpdate()
    return Response.json({
      status: 'success',
      updated,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Auto-Update] Fatal error:', error)
    return Response.json(
      { status: 'error', error: String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
