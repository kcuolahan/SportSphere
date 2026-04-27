'use client'

import { useState, useEffect } from 'react'

export interface BankrollPoint {
  label: string
  value: number
  projected: boolean
  picks?: number
  wins?: number
  losses?: number
  netPL?: number
  winRatePct?: number
}

export interface RoundStat {
  round: number
  picks: number
  wins: number
  losses: number
  winRatePct: number
  netPL: number
}

export interface PositionStat {
  position: string
  picks: number
  wins: number
  losses: number
  winRatePct: number
}

export interface SportSphereStats {
  hc: {
    totalPicks: number
    wins: number
    losses: number
    winRatePct: number
    grossPL: number
    roiPct: number
    latestRound: number
  }
  byRound: RoundStat[]
  byPosition: PositionStat[]
  currentRound: number | null
  projections: {
    totalRounds: number
    roundsTracked: number
    projectedGrossPL: number
    projectedBankroll: number
    seasonFee: number
    netAfterFee: number
    subscriptionMultiple: number
    monthlyFee: number
    seasonMonths: number
  }
  bankroll: BankrollPoint[]
  loading: boolean
  error: string | null
}

const DEFAULT_STATS: SportSphereStats = {
  hc: {
    totalPicks: 71,
    wins: 48,
    losses: 23,
    winRatePct: 67.6,
    grossPL: 18760,
    roiPct: 26.4,
    latestRound: 7,
  },
  byRound: [
    { round: 3, picks: 14, wins: 12, losses: 2,  winRatePct: 85.7, netPL:  8440 },
    { round: 4, picks: 19, wins: 9,  losses: 10, winRatePct: 47.4, netPL: -2170 },
    { round: 5, picks: 12, wins: 8,  losses: 4,  winRatePct: 66.7, netPL:  2960 },
    { round: 6, picks: 14, wins: 9,  losses: 5,  winRatePct: 64.3, netPL:  2830 },
    { round: 7, picks: 12, wins: 10, losses: 2,  winRatePct: 83.3, netPL:  6700 },
  ],
  byPosition: [
    { position: 'MID',  picks: 44, wins: 30, losses: 14, winRatePct: 68.2 },
    { position: 'DEF',  picks: 23, wins: 15, losses: 8,  winRatePct: 65.2 },
    { position: 'RUCK', picks: 4,  wins: 3,  losses: 1,  winRatePct: 75.0 },
  ],
  currentRound: 8,
  projections: {
    totalRounds: 24,
    roundsTracked: 5,
    projectedGrossPL: 90048,
    projectedBankroll: 91048,
    seasonFee: 174,
    netAfterFee: 89874,
    subscriptionMultiple: 517,
    monthlyFee: 29,
    seasonMonths: 6,
  },
  bankroll: [
    { label: 'Start',    value:  1000, projected: false },
    { label: 'R3',       value:  9440, projected: false },
    { label: 'R4',       value:  7270, projected: false },
    { label: 'R5',       value: 10230, projected: false },
    { label: 'R6',       value: 13060, projected: false },
    { label: 'R7',       value: 19760, projected: false },
    { label: 'R24 proj', value: 91048, projected: true  },
  ],
  loading: false,
  error: null,
}

export function useStats(sport = 'AFL'): SportSphereStats {
  const [stats, setStats] = useState<SportSphereStats>(DEFAULT_STATS)

  useEffect(() => {
    let cancelled = false
    setStats(prev => ({ ...prev, loading: true, error: null }))

    fetch(`/api/stats?sport=${sport}&season=2026`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (!cancelled) {
          if (data.hc && data.hc.totalPicks > 0) {
            setStats({ ...data, loading: false, error: null })
          } else {
            setStats(prev => ({ ...prev, loading: false }))
          }
        }
      })
      .catch(() => {
        // API unavailable or Supabase views not created yet — keep defaults
        if (!cancelled) {
          setStats(prev => ({ ...prev, loading: false }))
        }
      })

    return () => { cancelled = true }
  }, [sport])

  return stats
}
