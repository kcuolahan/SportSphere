import predictionsData from '@/data/predictions.json'
import resultsData from '@/data/results.json'
import teamStyleData from '@/data/team-style.json'
import playersData from '@/data/players.json'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Pick {
  player: string
  position: string
  team: string
  opponent: string
  venue: string
  condition: string
  bookie_line: number
  predicted: number
  edge: number
  direction: string
  confidence: string
  edge_vol: number
  enhanced_signal: string
  filter_pass: boolean
  avg_2025: number
  avg_2026: number
  line_at_publish?: number
  // H2H / form fields (added by enrich_h2h.py after scraping)
  h2h_vs_opponent?: Array<{ season: number; round: string; opponent: string; disposals: number; result?: string }>
  h2h_avg?: number | null
  h2h_sample?: number
  h2h_vs_line?: string | null
  recent_form?: number[]
  recent_avg?: number | null
  // optional model-detail fields (present when exported from full pipeline)
  play_style?: string
  bet_score?: number
  std_dev?: number
  volatility_tier?: string
  opp_factor?: number
  team_style_index?: number
  cba_pct?: number
}

export interface TeamNewsEntry {
  team: string
  player_out: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  note: string
  affects_players: string[]
}

export interface PredictionsData {
  round: number
  season: number
  generated_at: string
  verified_at?: string
  team_news?: TeamNewsEntry[]
  picks: Pick[]
}

export interface ResultPick {
  player: string
  position: string
  team: string
  line?: number
  bookie_line?: number
  predicted: number
  actual: number
  signal?: string
  enhanced_signal?: string
  confidence: string
  edge_vol: number
  result: 'WIN' | 'LOSS'
  abs_error?: number
  raw_inputs?: unknown
  // forward-compat fields from predictions format
  opponent?: string
  venue?: string
  condition?: string
  play_style?: string
  edge?: number
  direction?: string
}

export interface Round {
  round: number
  season: number
  total_picks: number
  wins: number
  losses: number
  win_rate: number
  picks: ResultPick[]
}

export interface SeasonSummary {
  total_picks: number
  overall_rate: number
  filtered_picks: number
  filtered_wins: number
  filtered_rate: number
  strong_picks: number
  strong_wins: number
  strong_rate: number
}

export interface TeamPosition {
  avg: number
  vs_league: number
  league_avg: number
  games: number
}

export interface Team {
  code: string
  name: string
  disposal_index: number
  concedes_by_position: {
    MID: TeamPosition
    DEF: TeamPosition
    FWD: TeamPosition
    RUCK: TeamPosition
  }
}

export interface Player {
  name: string
  team: string
  position: string
  play_style: string
  avg_2025: number
  avg_2026: number
  games_2025: number
  games_2026: number
  avg_kicks?: number
  avg_handballs?: number
  std_dev: number
  volatility_tier: string
  cba_pct: number
  avg_tog: number
  form_trend: 'UP' | 'DOWN' | 'STEADY'
  // Enhanced stats (populated by update_players.py)
  median_disposals?: number
  season_high?: number
  season_low?: number
  over_rate?: number
  last_5?: number[]
}

export interface ResultStats {
  total: number
  wins: number
  winRate: number
  strongTotal: number
  strongWins: number
  strongRate: number
  filteredTotal: number
  filteredWins: number
  filteredRate: number
}

// ── Accessors ──────────────────────────────────────────────────────────────

export function getCurrentPredictions(): PredictionsData {
  return predictionsData as PredictionsData
}

export function getAllResults(): Round[] {
  return resultsData.rounds as Round[]
}

export function getSeasonSummary(): SeasonSummary {
  return resultsData.season_summary as SeasonSummary
}

export function getTeamStyle(): Team[] {
  return teamStyleData.teams as Team[]
}

export function getTeamConcession(teamCode: string, position: string): TeamPosition | null {
  const teams = teamStyleData.teams as Team[]
  const team = teams.find(t => t.code === teamCode)
  if (!team) return null
  const pos = position as keyof typeof team.concedes_by_position
  return team.concedes_by_position[pos] ?? null
}

export function getPlayers(): Player[] {
  return playersData.players as Player[]
}

export function getPlayerByName(name: string): Player | undefined {
  return playersData.players.find(p => p.name === name) as Player | undefined
}

export function getResultStats(rounds?: number[]): ResultStats {
  if (!rounds) {
    const s = resultsData.season_summary
    return {
      total: s.total_picks,
      wins: Math.round(s.total_picks * s.overall_rate / 100),
      winRate: s.overall_rate,
      strongTotal: s.strong_picks,
      strongWins: s.strong_wins,
      strongRate: s.strong_rate,
      filteredTotal: s.filtered_picks,
      filteredWins: s.filtered_wins,
      filteredRate: s.filtered_rate,
    }
  }

  const data = resultsData.rounds.filter(r => rounds.includes(r.round))
  const totalPicks = data.reduce((sum, r) => sum + (r.total_picks ?? r.picks.length), 0)
  const totalWins = data.reduce((sum, r) => sum + (r.wins ?? 0), 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const picks: ResultPick[] = data.flatMap(r => (r as any).picks)
  const strong = picks.filter(p => p.confidence === 'STRONG')
  const strongWins = strong.filter(p => p.result === 'WIN').length
  const filtered = picks.filter(p => p.edge_vol >= 0.50)
  const filteredWins = filtered.filter(p => p.result === 'WIN').length

  return {
    total: totalPicks,
    wins: totalWins,
    winRate: totalPicks ? Math.round((totalWins / totalPicks) * 1000) / 10 : 0,
    strongTotal: strong.length,
    strongWins,
    strongRate: strong.length ? Math.round((strongWins / strong.length) * 1000) / 10 : 0,
    filteredTotal: filtered.length,
    filteredWins,
    filteredRate: filtered.length ? Math.round((filteredWins / filtered.length) * 1000) / 10 : 0,
  }
}
