import { NextResponse } from 'next/server'

const AFL_RULES = [
  { stat: 'disposals', threshold: 15, xp: 2 },
  { stat: 'disposals', threshold: 20, xp: 5 },
  { stat: 'disposals', threshold: 25, xp: 10 },
  { stat: 'disposals', threshold: 30, xp: 20 },
  { stat: 'disposals', threshold: 35, xp: 35 },
  { stat: 'disposals', threshold: 40, xp: 55 },
  { stat: 'disposals', threshold: 45, xp: 80 },
]

function calculateXP(sport: string, stats: Record<string, number>): number {
  if (sport === 'AFL') {
    const disposals = stats.disposals ?? 0
    let xp = 0
    for (const rule of AFL_RULES) {
      if (disposals >= rule.threshold) xp = rule.xp
    }
    return xp
  }
  return 0
}

export async function POST(request: Request) {
  const { sport, roundNumber, results } = await request.json()
  const xpEvents = (results || []).map((r: { playerName: string; stats: Record<string, number> }) => ({
    playerName: r.playerName,
    sport,
    roundNumber,
    xpEarned: calculateXP(sport, r.stats),
    stats: r.stats,
  }))
  return NextResponse.json({ xpEvents, processed: xpEvents.length })
}
