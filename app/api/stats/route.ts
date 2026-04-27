import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STAKE = 1000
const ODDS = 1.87
const WIN_PROFIT = Math.round(STAKE * (ODDS - 1))
const SEASON_FEE = 174
const TOTAL_ROUNDS = 24

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'AFL'
  const season = parseInt(searchParams.get('season') || '2026')

  try {
    const [hcRes, roundRes, posRes, roundRow] = await Promise.all([
      supabase.from('hc_stats').select('*').eq('sport', sport).eq('season', season).single(),
      supabase.from('round_stats').select('*').eq('sport', sport).eq('season', season).order('round', { ascending: true }),
      supabase.from('position_stats').select('*').eq('sport', sport).eq('season', season),
      supabase.from('rounds').select('*').eq('sport', sport).eq('season', season).eq('status', 'active').single(),
    ])

    const hcStats = hcRes.data
    const roundStats = roundRes.data ?? []
    const positionStats = posRes.data ?? []
    const currentRoundRow = roundRow.data

    // Build bankroll curve
    let bankroll = STAKE
    const bankrollData: Array<{ label: string; value: number; projected: boolean; picks?: number; wins?: number; losses?: number; netPL?: number; winRatePct?: number }> = [
      { label: 'Start', value: STAKE, projected: false },
    ]

    for (const r of roundStats) {
      const pl = (Number(r.wins) * WIN_PROFIT) - (Number(r.losses) * STAKE)
      bankroll += pl
      bankrollData.push({
        label: `R${r.round}`,
        value: Math.round(bankroll),
        projected: false,
        picks: r.picks,
        wins: r.wins,
        losses: r.losses,
        netPL: Math.round(pl),
        winRatePct: Number(r.win_rate_pct),
      })
    }

    const roundsTracked = roundStats.length
    const grossPLActual = bankroll - STAKE
    const avgPerRound = roundsTracked > 0 ? grossPLActual / roundsTracked : 0
    const roundsRemaining = TOTAL_ROUNDS - roundsTracked
    const projectedFinal = Math.round(bankroll + avgPerRound * roundsRemaining)
    const projectedGrossPL = projectedFinal - STAKE
    const netAfterFee = projectedGrossPL - SEASON_FEE
    const subscriptionMultiple = Math.round(netAfterFee / SEASON_FEE)

    bankrollData.push({ label: 'R24 proj', value: projectedFinal, projected: true })

    return NextResponse.json({
      sport,
      season,
      hc: {
        totalPicks: hcStats?.total_hc_picks ?? 0,
        wins: hcStats?.wins ?? 0,
        losses: hcStats?.losses ?? 0,
        winRatePct: Number(hcStats?.win_rate_pct ?? 0),
        grossPL: Number(hcStats?.gross_pl ?? 0),
        roiPct: Number(hcStats?.roi_pct ?? 0),
        latestRound: hcStats?.latest_round ?? 0,
      },
      byRound: roundStats.map(r => ({
        round: r.round,
        picks: r.picks,
        wins: r.wins,
        losses: r.losses,
        winRatePct: Number(r.win_rate_pct),
        netPL: Math.round((Number(r.wins) * WIN_PROFIT) - (Number(r.losses) * STAKE)),
      })),
      byPosition: (positionStats ?? []).map(p => ({
        position: p.position,
        picks: p.picks,
        wins: p.wins,
        losses: p.losses,
        winRatePct: Number(p.win_rate_pct),
      })),
      currentRound: currentRoundRow?.round_number ?? null,
      projections: {
        totalRounds: TOTAL_ROUNDS,
        roundsTracked,
        projectedGrossPL,
        projectedBankroll: projectedFinal,
        seasonFee: SEASON_FEE,
        netAfterFee,
        subscriptionMultiple,
        monthlyFee: 29,
        seasonMonths: 6,
      },
      bankroll: bankrollData,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
