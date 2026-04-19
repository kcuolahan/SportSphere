// Unified player data — all players tracked across Rounds 3–6, 2026 season

export interface PlayerStats {
  line: number
  model: number
  edge: number
  ev: number
  direction: 'OVER' | 'UNDER'
  tier: 'HC' | 'BET' | 'SKIP'
  stdDev: number
}

export interface HistoricalRound {
  round: number
  disposals: number
  line: number
  result: 'WIN' | 'LOSS'
}

export interface Player {
  id: string
  fullName: string
  team: string
  opponent: string
  position: 'MID' | 'DEF' | 'FWD' | 'RUCK'
  venue: string
  stats: PlayerStats
  historicalRounds: HistoricalRound[]
  seasonAvg2025: number
  seasonAvg2026: number
  stdDev: number
  togPct: number
  cbaRate: number
  playStyle: 'inside' | 'outside' | 'contested' | 'run-and-gun'
  imageUrl: string
}

function mkStats(line: number, model: number, stdDev: number): PlayerStats {
  const edge = Math.round((model - line) * 10) / 10
  const ev = Math.round(Math.abs(edge) / stdDev * 1000) / 1000
  const direction: 'OVER' | 'UNDER' = edge >= 0 ? 'OVER' : 'UNDER'
  const tier: 'HC' | 'BET' | 'SKIP' = ev >= 0.90 ? 'HC' : ev >= 0.50 ? 'BET' : 'SKIP'
  return { line, model, edge, ev, direction, tier, stdDev }
}

function hr(round: number, disposals: number, line: number, result: 'WIN' | 'LOSS'): HistoricalRound {
  return { round, disposals, line, result }
}

// ── COLLINGWOOD (vs Carlton, MCG) ──────────────────────────────────────────
// ── CARLTON (vs Collingwood, MCG) ──────────────────────────────────────────
// ── GWS GIANTS (vs Sydney, SCG) ────────────────────────────────────────────
// ── SYDNEY (vs GWS, SCG) ───────────────────────────────────────────────────
// ── GEELONG (vs Western Bulldogs, GMHBA Stadium) ───────────────────────────
// ── WESTERN BULLDOGS (vs Geelong, GMHBA Stadium) ───────────────────────────
// ── ADELAIDE (vs Hawthorn, Adelaide Oval) ──────────────────────────────────
// ── HAWTHORN (vs Adelaide, Adelaide Oval) ──────────────────────────────────
// ── ST KILDA (vs Brisbane, Marvel Stadium) ─────────────────────────────────
// ── BRISBANE (vs St Kilda, Marvel Stadium) ─────────────────────────────────
// ── FREMANTLE (vs Melbourne, Optus Stadium) ────────────────────────────────
// ── MELBOURNE (vs Fremantle, Optus Stadium) ────────────────────────────────
// ── ESSENDON (vs West Coast, Marvel Stadium) ───────────────────────────────

export const PLAYERS: Player[] = [

  // ── COLLINGWOOD ──────────────────────────────────────────────────────────
  {
    id: 'nick-daicos', fullName: 'Nick Daicos', team: 'COL',
    opponent: 'CAR', position: 'MID', venue: 'MCG',
    stats: mkStats(30.5, 35.1, 5.73),
    seasonAvg2025: 30.1, seasonAvg2026: 32.4, stdDev: 5.73,
    togPct: 0.86, cbaRate: 0.72, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 36, 30.5, 'WIN'), hr(4, 28, 30.5, 'LOSS'), hr(5, 36, 30.5, 'WIN')],
  },
  {
    id: 'josh-daicos', fullName: 'Josh Daicos', team: 'COL',
    opponent: 'CAR', position: 'MID', venue: 'MCG',
    stats: mkStats(26.5, 27.0, 5.8),
    seasonAvg2025: 28.4, seasonAvg2026: 30.1, stdDev: 5.8,
    togPct: 0.84, cbaRate: 0.48, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 33, 26.5, 'WIN'), hr(4, 28, 27.5, 'WIN'), hr(5, 26, 28.5, 'WIN')],
  },
  {
    id: 'scott-pendlebury', fullName: 'Scott Pendlebury', team: 'COL',
    opponent: 'CAR', position: 'MID', venue: 'MCG',
    stats: mkStats(21.5, 16.7, 5.79),
    seasonAvg2025: 19.4, seasonAvg2026: 17.2, stdDev: 5.79,
    togPct: 0.78, cbaRate: 0.12, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 18, 20.5, 'WIN'), hr(4, 21, 20.5, 'LOSS'), hr(5, 15, 21.5, 'WIN')],
  },
  {
    id: 'jordan-de-goey', fullName: 'Jordan De Goey', team: 'COL',
    opponent: 'CAR', position: 'MID', venue: 'MCG',
    stats: mkStats(18.5, 17.2, 6.6),
    seasonAvg2025: 22.1, seasonAvg2026: 20.8, stdDev: 6.6,
    togPct: 0.82, cbaRate: 0.35, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 20, 20.5, 'WIN'), hr(4, 16, 18.5, 'WIN'), hr(5, 19, 20.5, 'WIN')],
  },
  {
    id: 'steele-sidebottom', fullName: 'Steele Sidebottom', team: 'COL',
    opponent: 'CAR', position: 'MID', venue: 'MCG',
    stats: mkStats(16.5, 17.5, 6.4),
    seasonAvg2025: 18.2, seasonAvg2026: 19.4, stdDev: 6.4,
    togPct: 0.80, cbaRate: 0.08, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 17, 18.5, 'WIN'), hr(4, 31, 16.5, 'WIN'), hr(5, 14, 18.5, 'WIN')],
  },
  {
    id: 'darcy-moore', fullName: 'Darcy Moore', team: 'COL',
    opponent: 'CAR', position: 'DEF', venue: 'MCG',
    stats: mkStats(16.5, 15.8, 4.2),
    seasonAvg2025: 15.8, seasonAvg2026: 16.1, stdDev: 4.2,
    togPct: 0.84, cbaRate: 0.0, playStyle: 'outside', imageUrl: '',
    historicalRounds: [hr(3, 14, 16.5, 'WIN'), hr(4, 17, 16.5, 'LOSS'), hr(5, 18, 16.5, 'LOSS')],
  },
  {
    id: 'brayden-maynard', fullName: 'Brayden Maynard', team: 'COL',
    opponent: 'CAR', position: 'DEF', venue: 'MCG',
    stats: mkStats(13.5, 14.2, 4.8),
    seasonAvg2025: 14.0, seasonAvg2026: 13.8, stdDev: 4.8,
    togPct: 0.82, cbaRate: 0.0, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 16, 14.5, 'LOSS'), hr(4, 13, 13.5, 'WIN'), hr(5, 15, 14.5, 'LOSS')],
  },

  // ── CARLTON ───────────────────────────────────────────────────────────────
  {
    id: 'sam-walsh', fullName: 'Sam Walsh', team: 'CAR',
    opponent: 'COL', position: 'MID', venue: 'MCG',
    stats: mkStats(29.5, 30.2, 5.9),
    seasonAvg2025: 30.2, seasonAvg2026: 29.4, stdDev: 5.9,
    togPct: 0.87, cbaRate: 0.62, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 28, 29.5, 'WIN'), hr(4, 31, 29.5, 'LOSS'), hr(5, 31, 29.5, 'LOSS')],
  },
  {
    id: 'patrick-cripps', fullName: 'Patrick Cripps', team: 'CAR',
    opponent: 'COL', position: 'MID', venue: 'MCG',
    stats: mkStats(25.5, 25.0, 5.2),
    seasonAvg2025: 27.8, seasonAvg2026: 26.5, stdDev: 5.2,
    togPct: 0.86, cbaRate: 0.80, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 27, 26.5, 'WIN'), hr(4, 29, 25.5, 'LOSS'), hr(5, 24, 26.5, 'WIN')],
  },
  {
    id: 'charlie-curnow', fullName: 'Charlie Curnow', team: 'CAR',
    opponent: 'COL', position: 'FWD', venue: 'MCG',
    stats: mkStats(13.5, 14.5, 5.5),
    seasonAvg2025: 14.2, seasonAvg2026: 14.6, stdDev: 5.5,
    togPct: 0.78, cbaRate: 0.0, playStyle: 'outside', imageUrl: '',
    historicalRounds: [hr(3, 13, 14.5, 'WIN'), hr(4, 16, 13.5, 'LOSS'), hr(5, 11, 13.5, 'WIN')],
  },
  {
    id: 'matthew-kennedy', fullName: 'Matthew Kennedy', team: 'CAR',
    opponent: 'COL', position: 'MID', venue: 'MCG',
    stats: mkStats(18.5, 18.0, 5.8),
    seasonAvg2025: 19.2, seasonAvg2026: 18.4, stdDev: 5.8,
    togPct: 0.80, cbaRate: 0.30, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 19, 18.5, 'LOSS'), hr(4, 17, 18.5, 'WIN'), hr(5, 20, 18.5, 'LOSS')],
  },

  // ── GWS GIANTS ────────────────────────────────────────────────────────────
  {
    id: 'lachie-ash', fullName: 'Lachie Ash', team: 'GWS',
    opponent: 'SYD', position: 'DEF', venue: 'SCG',
    stats: mkStats(27.5, 31.3, 3.4),
    seasonAvg2025: 29.8, seasonAvg2026: 30.5, stdDev: 3.4,
    togPct: 0.88, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 28, 27.5, 'WIN'), hr(4, 31, 28.5, 'WIN'), hr(5, 33, 27.5, 'WIN')],
  },
  {
    id: 'lachie-whitfield', fullName: 'Lachie Whitfield', team: 'GWS',
    opponent: 'SYD', position: 'DEF', venue: 'SCG',
    stats: mkStats(27.5, 31.1, 3.6),
    seasonAvg2025: 30.4, seasonAvg2026: 29.7, stdDev: 3.6,
    togPct: 0.87, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 31, 29.5, 'WIN'), hr(4, 39, 29.5, 'WIN'), hr(5, 28, 29.5, 'WIN')],
  },
  {
    id: 'finn-callaghan', fullName: 'Finn Callaghan', team: 'GWS',
    opponent: 'SYD', position: 'MID', venue: 'SCG',
    stats: mkStats(26.5, 27.5, 6.0),
    seasonAvg2025: 27.2, seasonAvg2026: 28.8, stdDev: 6.0,
    togPct: 0.84, cbaRate: 0.55, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 25, 26.5, 'WIN'), hr(4, 35, 26.5, 'WIN'), hr(5, 30, 27.5, 'WIN')],
  },
  {
    id: 'connor-idun', fullName: 'Connor Idun', team: 'GWS',
    opponent: 'SYD', position: 'DEF', venue: 'SCG',
    stats: mkStats(18.5, 22.5, 4.3),
    seasonAvg2025: 20.1, seasonAvg2026: 19.8, stdDev: 4.3,
    togPct: 0.82, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 22, 18.5, 'LOSS'), hr(4, 19, 19.5, 'WIN'), hr(5, 21, 19.5, 'LOSS')],
  },
  {
    id: 'tom-green', fullName: 'Tom Green', team: 'GWS',
    opponent: 'SYD', position: 'MID', venue: 'SCG',
    stats: mkStats(22.5, 23.0, 5.5),
    seasonAvg2025: 22.4, seasonAvg2026: 22.8, stdDev: 5.5,
    togPct: 0.83, cbaRate: 0.50, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 21, 22.5, 'WIN'), hr(4, 25, 22.5, 'LOSS'), hr(5, 23, 22.5, 'WIN')],
  },

  // ── SYDNEY ────────────────────────────────────────────────────────────────
  {
    id: 'brodie-grundy', fullName: 'Brodie Grundy', team: 'SYD',
    opponent: 'GWS', position: 'RUCK', venue: 'SCG',
    stats: mkStats(21.5, 16.0, 4.8),
    seasonAvg2025: 18.2, seasonAvg2026: 16.8, stdDev: 4.8,
    togPct: 0.80, cbaRate: 0.85, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 17, 21.5, 'WIN'), hr(4, 20, 21.5, 'WIN'), hr(5, 14, 21.5, 'WIN')],
  },
  {
    id: 'angus-sheldrick', fullName: 'Angus Sheldrick', team: 'SYD',
    opponent: 'GWS', position: 'MID', venue: 'SCG',
    stats: mkStats(23.5, 18.8, 4.98),
    seasonAvg2025: 19.8, seasonAvg2026: 21.3, stdDev: 4.98,
    togPct: 0.81, cbaRate: 0.28, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 20, 22.5, 'WIN'), hr(4, 18, 22.5, 'WIN'), hr(5, 19, 23.5, 'WIN')],
  },
  {
    id: 'nick-blakey', fullName: 'Nick Blakey', team: 'SYD',
    opponent: 'GWS', position: 'DEF', venue: 'SCG',
    stats: mkStats(21.5, 24.6, 5.0),
    seasonAvg2025: 22.8, seasonAvg2026: 23.4, stdDev: 5.0,
    togPct: 0.85, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 24, 21.5, 'LOSS'), hr(4, 22, 22.5, 'WIN'), hr(5, 25, 22.5, 'LOSS')],
  },
  {
    id: 'tom-mccartin', fullName: 'Tom McCartin', team: 'SYD',
    opponent: 'GWS', position: 'DEF', venue: 'SCG',
    stats: mkStats(16.5, 20.0, 4.5),
    seasonAvg2025: 16.8, seasonAvg2026: 17.5, stdDev: 4.5,
    togPct: 0.83, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 17, 16.5, 'LOSS'), hr(4, 19, 16.5, 'LOSS'), hr(5, 16, 16.5, 'WIN')],
  },
  {
    id: 'chad-warner', fullName: 'Chad Warner', team: 'SYD',
    opponent: 'GWS', position: 'MID', venue: 'SCG',
    stats: mkStats(26.5, 27.2, 5.6),
    seasonAvg2025: 26.4, seasonAvg2026: 27.1, stdDev: 5.6,
    togPct: 0.85, cbaRate: 0.55, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 28, 26.5, 'LOSS'), hr(4, 25, 26.5, 'WIN'), hr(5, 30, 26.5, 'LOSS')],
  },
  {
    id: 'errol-gulden', fullName: 'Errol Gulden', team: 'SYD',
    opponent: 'GWS', position: 'MID', venue: 'SCG',
    stats: mkStats(22.5, 21.5, 5.4),
    seasonAvg2025: 22.0, seasonAvg2026: 21.8, stdDev: 5.4,
    togPct: 0.82, cbaRate: 0.40, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 23, 22.5, 'LOSS'), hr(4, 20, 22.5, 'WIN'), hr(5, 22, 22.5, 'WIN')],
  },

  // ── GEELONG ───────────────────────────────────────────────────────────────
  {
    id: 'bailey-smith', fullName: 'Bailey Smith', team: 'GEE',
    opponent: 'WBD', position: 'MID', venue: 'GMHBA Stadium',
    stats: mkStats(31.5, 35.0, 5.65),
    seasonAvg2025: 32.1, seasonAvg2026: 33.2, stdDev: 5.65,
    togPct: 0.85, cbaRate: 0.58, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 30, 31.5, 'WIN'), hr(4, 33, 31.5, 'WIN'), hr(5, 34, 31.5, 'WIN')],
  },
  {
    id: 'tom-stewart', fullName: 'Tom Stewart', team: 'GEE',
    opponent: 'WBD', position: 'DEF', venue: 'GMHBA Stadium',
    stats: mkStats(22.5, 23.0, 5.6),
    seasonAvg2025: 24.4, seasonAvg2026: 23.8, stdDev: 5.6,
    togPct: 0.86, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 24, 22.5, 'LOSS'), hr(4, 22, 22.5, 'WIN'), hr(5, 25, 22.5, 'LOSS')],
  },
  {
    id: 'tanner-bruhn', fullName: 'Tanner Bruhn', team: 'GEE',
    opponent: 'WBD', position: 'MID', venue: 'GMHBA Stadium',
    stats: mkStats(23.5, 22.5, 5.5),
    seasonAvg2025: 24.8, seasonAvg2026: 25.5, stdDev: 5.5,
    togPct: 0.82, cbaRate: 0.42, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 26, 24.5, 'LOSS'), hr(4, 15, 23.5, 'LOSS'), hr(5, 28, 24.5, 'LOSS')],
  },
  {
    id: 'jeremy-cameron', fullName: 'Jeremy Cameron', team: 'GEE',
    opponent: 'WBD', position: 'FWD', venue: 'GMHBA Stadium',
    stats: mkStats(13.5, 15.0, 5.8),
    seasonAvg2025: 14.2, seasonAvg2026: 14.8, stdDev: 5.8,
    togPct: 0.78, cbaRate: 0.0, playStyle: 'outside', imageUrl: '',
    historicalRounds: [hr(3, 12, 14.5, 'WIN'), hr(4, 17, 13.5, 'LOSS'), hr(5, 14, 13.5, 'LOSS')],
  },
  {
    id: 'mark-blicavs', fullName: 'Mark Blicavs', team: 'GEE',
    opponent: 'WBD', position: 'RUCK', venue: 'GMHBA Stadium',
    stats: mkStats(17.5, 18.0, 4.2),
    seasonAvg2025: 18.0, seasonAvg2026: 17.6, stdDev: 4.2,
    togPct: 0.84, cbaRate: 0.70, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 18, 18.5, 'WIN'), hr(4, 16, 17.5, 'WIN'), hr(5, 19, 18.5, 'LOSS')],
  },

  // ── WESTERN BULLDOGS ──────────────────────────────────────────────────────
  {
    id: 'marcus-bontempelli', fullName: 'Marcus Bontempelli', team: 'WBD',
    opponent: 'GEE', position: 'MID', venue: 'GMHBA Stadium',
    stats: mkStats(28.5, 30.0, 5.3),
    seasonAvg2025: 28.8, seasonAvg2026: 29.4, stdDev: 5.3,
    togPct: 0.86, cbaRate: 0.65, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 27, 28.5, 'WIN'), hr(4, 31, 28.5, 'LOSS'), hr(5, 30, 29.5, 'WIN')],
  },
  {
    id: 'adam-treloar', fullName: 'Adam Treloar', team: 'WBD',
    opponent: 'GEE', position: 'MID', venue: 'GMHBA Stadium',
    stats: mkStats(26.5, 25.5, 5.6),
    seasonAvg2025: 27.2, seasonAvg2026: 26.1, stdDev: 5.6,
    togPct: 0.84, cbaRate: 0.48, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 25, 26.5, 'WIN'), hr(4, 28, 26.5, 'LOSS'), hr(5, 24, 26.5, 'WIN')],
  },
  {
    id: 'jack-macrae', fullName: 'Jack Macrae', team: 'WBD',
    opponent: 'GEE', position: 'MID', venue: 'GMHBA Stadium',
    stats: mkStats(25.5, 26.0, 5.4),
    seasonAvg2025: 26.0, seasonAvg2026: 25.8, stdDev: 5.4,
    togPct: 0.85, cbaRate: 0.40, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 28, 25.5, 'LOSS'), hr(4, 24, 25.5, 'WIN'), hr(5, 27, 25.5, 'LOSS')],
  },

  // ── ADELAIDE ──────────────────────────────────────────────────────────────
  {
    id: 'james-peatling', fullName: 'James Peatling', team: 'ADE',
    opponent: 'HAW', position: 'MID', venue: 'Adelaide Oval',
    stats: mkStats(17.5, 18.5, 6.9),
    seasonAvg2025: 18.4, seasonAvg2026: 19.2, stdDev: 6.9,
    togPct: 0.80, cbaRate: 0.30, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 22, 17.5, 'WIN'), hr(4, 18, 18.5, 'WIN'), hr(5, 16, 18.5, 'WIN')],
  },
  {
    id: 'chayce-jones', fullName: 'Chayce Jones', team: 'ADE',
    opponent: 'HAW', position: 'MID', venue: 'Adelaide Oval',
    stats: mkStats(16.5, 17.0, 7.6),
    seasonAvg2025: 17.2, seasonAvg2026: 16.8, stdDev: 7.6,
    togPct: 0.79, cbaRate: 0.22, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 9, 17.5, 'WIN'), hr(4, 14, 16.5, 'WIN'), hr(5, 18, 16.5, 'LOSS')],
  },
  {
    id: 'isaac-cumming', fullName: 'Isaac Cumming', team: 'ADE',
    opponent: 'HAW', position: 'DEF', venue: 'Adelaide Oval',
    stats: mkStats(16.5, 16.0, 5.2),
    seasonAvg2025: 17.4, seasonAvg2026: 17.8, stdDev: 5.2,
    togPct: 0.82, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 10, 16.5, 'LOSS'), hr(4, 15, 16.5, 'WIN'), hr(5, 18, 16.5, 'LOSS')],
  },
  {
    id: 'izak-rankine', fullName: 'Izak Rankine', team: 'ADE',
    opponent: 'HAW', position: 'FWD', venue: 'Adelaide Oval',
    stats: mkStats(18.5, 19.0, 7.2),
    seasonAvg2025: 16.2, seasonAvg2026: 17.4, stdDev: 7.2,
    togPct: 0.78, cbaRate: 0.0, playStyle: 'outside', imageUrl: '',
    historicalRounds: [hr(3, 14, 17.5, 'WIN'), hr(4, 19, 17.5, 'LOSS'), hr(5, 7, 18.5, 'LOSS')],
  },
  {
    id: 'rory-laird', fullName: 'Rory Laird', team: 'ADE',
    opponent: 'HAW', position: 'DEF', venue: 'Adelaide Oval',
    stats: mkStats(22.5, 21.5, 4.8),
    seasonAvg2025: 23.2, seasonAvg2026: 22.4, stdDev: 4.8,
    togPct: 0.87, cbaRate: 0.0, playStyle: 'outside', imageUrl: '',
    historicalRounds: [hr(3, 20, 22.5, 'WIN'), hr(4, 24, 22.5, 'LOSS'), hr(5, 22, 22.5, 'WIN')],
  },
  {
    id: 'jordan-dawson', fullName: 'Jordan Dawson', team: 'ADE',
    opponent: 'HAW', position: 'DEF', venue: 'Adelaide Oval',
    stats: mkStats(22.5, 22.0, 5.1),
    seasonAvg2025: 22.8, seasonAvg2026: 21.9, stdDev: 5.1,
    togPct: 0.86, cbaRate: 0.0, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 21, 22.5, 'WIN'), hr(4, 23, 22.5, 'LOSS'), hr(5, 20, 22.5, 'WIN')],
  },

  // ── ST KILDA ──────────────────────────────────────────────────────────────
  {
    id: 'sam-flanders', fullName: 'Sam Flanders', team: 'STK',
    opponent: 'BRL', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(25.5, 26.0, 5.3),
    seasonAvg2025: 24.8, seasonAvg2026: 23.4, stdDev: 5.3,
    togPct: 0.83, cbaRate: 0.45, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 22, 26.5, 'WIN'), hr(4, 24, 25.5, 'WIN'), hr(5, 26, 25.5, 'LOSS')],
  },
  {
    id: 'mattaes-phillipou', fullName: 'Mattaes Phillipou', team: 'STK',
    opponent: 'BRL', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(19.5, 21.0, 7.5),
    seasonAvg2025: 18.4, seasonAvg2026: 20.1, stdDev: 7.5,
    togPct: 0.80, cbaRate: 0.35, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 15, 18.5, 'WIN'), hr(4, 22, 18.5, 'LOSS'), hr(5, 19, 19.5, 'WIN')],
  },
  {
    id: 'jack-steele', fullName: 'Jack Steele', team: 'STK',
    opponent: 'BRL', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(24.5, 24.0, 5.8),
    seasonAvg2025: 24.8, seasonAvg2026: 24.2, stdDev: 5.8,
    togPct: 0.84, cbaRate: 0.55, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 23, 24.5, 'WIN'), hr(4, 26, 24.5, 'LOSS'), hr(5, 22, 24.5, 'WIN')],
  },

  // ── BRISBANE ──────────────────────────────────────────────────────────────
  {
    id: 'lachlan-neale', fullName: 'Lachlan Neale', team: 'BRL',
    opponent: 'STK', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(31.5, 32.0, 5.2),
    seasonAvg2025: 32.2, seasonAvg2026: 31.8, stdDev: 5.2,
    togPct: 0.87, cbaRate: 0.70, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 33, 31.5, 'LOSS'), hr(4, 30, 31.5, 'WIN'), hr(5, 32, 31.5, 'WIN')],
  },
  {
    id: 'josh-dunkley', fullName: 'Josh Dunkley', team: 'BRL',
    opponent: 'STK', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(28.5, 29.0, 5.7),
    seasonAvg2025: 29.0, seasonAvg2026: 28.6, stdDev: 5.7,
    togPct: 0.85, cbaRate: 0.58, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 27, 28.5, 'WIN'), hr(4, 30, 28.5, 'LOSS'), hr(5, 29, 28.5, 'WIN')],
  },

  // ── HAWTHORN ──────────────────────────────────────────────────────────────
  {
    id: 'jai-newcombe', fullName: 'Jai Newcombe', team: 'HAW',
    opponent: 'ADE', position: 'MID', venue: 'Adelaide Oval',
    stats: mkStats(26.5, 28.0, 5.4),
    seasonAvg2025: 26.8, seasonAvg2026: 27.4, stdDev: 5.4,
    togPct: 0.84, cbaRate: 0.58, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 28, 26.5, 'LOSS'), hr(4, 25, 26.5, 'WIN'), hr(5, 30, 26.5, 'LOSS')],
  },
  {
    id: 'tom-mitchell', fullName: 'Tom Mitchell', team: 'HAW',
    opponent: 'ADE', position: 'MID', venue: 'Adelaide Oval',
    stats: mkStats(21.5, 22.0, 5.9),
    seasonAvg2025: 22.0, seasonAvg2026: 21.6, stdDev: 5.9,
    togPct: 0.82, cbaRate: 0.42, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 22, 21.5, 'LOSS'), hr(4, 20, 21.5, 'WIN'), hr(5, 23, 21.5, 'WIN')],
  },

  // ── FREMANTLE ─────────────────────────────────────────────────────────────
  {
    id: 'caleb-serong', fullName: 'Caleb Serong', team: 'FRE',
    opponent: 'MEL', position: 'MID', venue: 'Optus Stadium',
    stats: mkStats(28.5, 30.0, 5.2),
    seasonAvg2025: 28.8, seasonAvg2026: 29.2, stdDev: 5.2,
    togPct: 0.86, cbaRate: 0.65, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 30, 28.5, 'LOSS'), hr(4, 27, 28.5, 'WIN'), hr(5, 31, 28.5, 'LOSS')],
  },
  {
    id: 'andrew-brayshaw', fullName: 'Andrew Brayshaw', team: 'FRE',
    opponent: 'MEL', position: 'MID', venue: 'Optus Stadium',
    stats: mkStats(26.5, 27.0, 5.5),
    seasonAvg2025: 27.0, seasonAvg2026: 26.8, stdDev: 5.5,
    togPct: 0.84, cbaRate: 0.52, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 25, 26.5, 'WIN'), hr(4, 28, 26.5, 'LOSS'), hr(5, 27, 26.5, 'WIN')],
  },

  // ── MELBOURNE ─────────────────────────────────────────────────────────────
  {
    id: 'christian-petracca', fullName: 'Christian Petracca', team: 'MEL',
    opponent: 'FRE', position: 'MID', venue: 'Optus Stadium',
    stats: mkStats(26.5, 28.0, 6.1),
    seasonAvg2025: 27.2, seasonAvg2026: 26.8, stdDev: 6.1,
    togPct: 0.85, cbaRate: 0.62, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 28, 26.5, 'LOSS'), hr(4, 25, 26.5, 'WIN'), hr(5, 29, 26.5, 'LOSS')],
  },
  {
    id: 'clayton-oliver', fullName: 'Clayton Oliver', team: 'MEL',
    opponent: 'FRE', position: 'MID', venue: 'Optus Stadium',
    stats: mkStats(25.5, 26.0, 6.4),
    seasonAvg2025: 26.0, seasonAvg2026: 25.4, stdDev: 6.4,
    togPct: 0.83, cbaRate: 0.68, playStyle: 'inside', imageUrl: '',
    historicalRounds: [hr(3, 24, 25.5, 'WIN'), hr(4, 27, 25.5, 'LOSS'), hr(5, 25, 25.5, 'WIN')],
  },
  {
    id: 'max-gawn', fullName: 'Max Gawn', team: 'MEL',
    opponent: 'FRE', position: 'RUCK', venue: 'Optus Stadium',
    stats: mkStats(23.5, 22.5, 4.5),
    seasonAvg2025: 24.2, seasonAvg2026: 23.6, stdDev: 4.5,
    togPct: 0.82, cbaRate: 0.88, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 22, 23.5, 'WIN'), hr(4, 25, 23.5, 'LOSS'), hr(5, 21, 23.5, 'WIN')],
  },

  // ── ESSENDON ──────────────────────────────────────────────────────────────
  {
    id: 'zach-merrett', fullName: 'Zach Merrett', team: 'ESS',
    opponent: 'WCE', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(28.5, 29.5, 5.6),
    seasonAvg2025: 28.8, seasonAvg2026: 29.0, stdDev: 5.6,
    togPct: 0.86, cbaRate: 0.60, playStyle: 'run-and-gun', imageUrl: '',
    historicalRounds: [hr(3, 30, 28.5, 'LOSS'), hr(4, 27, 28.5, 'WIN'), hr(5, 31, 28.5, 'LOSS')],
  },
  {
    id: 'dylan-shiel', fullName: 'Dylan Shiel', team: 'ESS',
    opponent: 'WCE', position: 'MID', venue: 'Marvel Stadium',
    stats: mkStats(24.5, 24.0, 6.0),
    seasonAvg2025: 24.8, seasonAvg2026: 24.2, stdDev: 6.0,
    togPct: 0.82, cbaRate: 0.38, playStyle: 'contested', imageUrl: '',
    historicalRounds: [hr(3, 23, 24.5, 'WIN'), hr(4, 26, 24.5, 'LOSS'), hr(5, 22, 24.5, 'WIN')],
  },
]

// ── Utility functions ─────────────────────────────────────────────────────

export function getPlayersByRound(round: number): Player[] {
  return PLAYERS.filter(p => p.historicalRounds.some(r => r.round === round))
}

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find(p => p.id === id)
}

export function getPlayersByTeam(team: string): Player[] {
  return PLAYERS.filter(p => p.team === team)
}

export function getPlayersByPosition(position: Player['position']): Player[] {
  return PLAYERS.filter(p => p.position === position)
}
