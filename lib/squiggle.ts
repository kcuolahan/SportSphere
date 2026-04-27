const SQUIGGLE_BASE = 'https://api.squiggle.com.au/'
const USER_AGENT = 'SportSphere/1.0 (keegan.cuolahan9@gmail.com)'

interface SquiggleStat {
  player: string
  team: string
  disposals: number
  year: number
  round: number
}

export async function getPlayerDisposals(
  playerName: string,
  team: string,
  round: number,
): Promise<number | null> {
  try {
    const year = new Date().getFullYear()
    const url = `${SQUIGGLE_BASE}?q=stats;year=${year};round=${round}`
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      cache: 'no-store',
    })
    if (!response.ok) return null
    const data = await response.json()
    const stats: SquiggleStat[] = data.stats ?? []

    // Exact name + team match first
    let stat = stats.find(
      s =>
        s.player.toLowerCase() === playerName.toLowerCase() &&
        s.team.toUpperCase() === team.toUpperCase(),
    )

    // Fall back to last-name + team match (handles "Zak" vs "Zachary")
    if (!stat) {
      const lastName = playerName.split(' ').pop()?.toLowerCase() ?? ''
      stat = stats.find(
        s =>
          s.player.toLowerCase().includes(lastName) &&
          s.team.toUpperCase() === team.toUpperCase(),
      )
    }

    return stat?.disposals ?? null
  } catch (error) {
    console.error(`Failed to fetch disposals for ${playerName}:`, error)
    return null
  }
}

export function calculatePickResult(
  prediction: 'OVER' | 'UNDER',
  finalDisposals: number,
  line: number,
  odds: number,
  stake: number = 1000,
) {
  const hit = prediction === 'OVER' ? finalDisposals >= line : finalDisposals <= line
  return {
    result: hit ? 'WIN' : 'LOSS',
    profitLoss: hit ? Math.round(stake * (odds - 1)) : -stake,
    finalDisposals,
    margin: Math.abs(finalDisposals - line),
  }
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function getUnresolvedPicksFromSupabase() {
  try {
    const { data, error } = await getServiceClient()
      .from('live_picks')
      .select('*')
      .is('result', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching picks from Supabase:', error)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Supabase connection error:', err)
    return []
  }
}

export async function updatePickResultInSupabase(
  pickId: string,
  finalDisposals: number,
  result: 'WIN' | 'LOSS',
  profitLoss: number,
) {
  try {
    const { error } = await getServiceClient()
      .from('live_picks')
      .update({
        final_disposals: finalDisposals,
        result,
        profit_loss: profitLoss,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pickId)

    if (error) {
      console.error(`Error updating pick ${pickId}:`, error)
      return false
    }
    return true
  } catch (err) {
    console.error(`Supabase update error for pick ${pickId}:`, err)
    return false
  }
}
