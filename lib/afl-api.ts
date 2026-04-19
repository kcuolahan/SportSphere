/**
 * AFL data ingestion layer
 * Primary:   https://aflapi.afl.com.au/afl/v2/
 * Secondary: https://api.squiggle.com.au/  (free, no auth required)
 *
 * Usage: functions are ready to call but AFL API requires no auth for
 * public endpoints. Set AFL_API_KEY env var if you obtain a licensed key.
 */

const AFL_BASE = "https://aflapi.afl.com.au/afl/v2";
const SQUIGGLE_BASE = "https://api.squiggle.com.au";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Position = "MID" | "DEF" | "FWD" | "RUCK";

export interface Fixture {
  fixtureId: string;
  round: number;
  season: number;
  homeTeam: { id: string; code: string; name: string };
  awayTeam: { id: string; code: string; name: string };
  venue: string;
  startTime: string;
  status: "scheduled" | "in_progress" | "completed";
}

export interface PlayerSeasonStats {
  playerId: string;
  name: string;
  team: string;
  position: Position;
  gamesPlayed: number;
  avgDisposals: number;
  avgKicks: number;
  avgHandballs: number;
  avgGoals: number;
  avgMarks: number;
  togPct: number;
  cbaPct: number;
}

export interface RoundStat {
  round: number;
  opponent: string;
  venue: string;
  disposals: number;
  kicks: number;
  handballs: number;
  goals: number;
  marks: number;
  tog: number;
  cba: number;
}

export interface DvPData {
  teamId: string;
  teamCode: string;
  position: Position;
  avgDisposalsAllowed: number;
  vsLeagueAvg: number;
  rank: number;
  lastFiveGames: Array<{ round: number; opponent: string; disposalsAllowed: number }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function aflFetch<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.AFL_API_KEY) headers["Authorization"] = `Bearer ${process.env.AFL_API_KEY}`;
  const res = await fetch(`${AFL_BASE}${path}`, { headers, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`AFL API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function squiggleFetch<T>(query: string): Promise<T> {
  const res = await fetch(`${SQUIGGLE_BASE}/?${query}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Squiggle API error ${res.status}: ${query}`);
  return res.json() as Promise<T>;
}

// ── Public API functions ───────────────────────────────────────────────────────

/**
 * Fetch all fixtures for the current round.
 * Falls back to Squiggle if AFL API unavailable.
 */
export async function fetchCurrentRoundFixtures(): Promise<Fixture[]> {
  try {
    const data = await aflFetch<{ fixtures: Fixture[] }>("/fixtures?filter=currentRound");
    return data.fixtures;
  } catch {
    // Squiggle fallback
    const data = await squiggleFetch<{ games: any[] }>("q=games;year=2026;complete=!100");
    return data.games.map(g => ({
      fixtureId: String(g.id),
      round: g.round,
      season: g.year,
      homeTeam: { id: String(g.hteamid), code: g.hteam, name: g.hteam },
      awayTeam: { id: String(g.ateamid), code: g.ateam, name: g.ateam },
      venue: g.venue,
      startTime: g.date,
      status: g.complete === 100 ? "completed" : g.complete > 0 ? "in_progress" : "scheduled",
    }));
  }
}

/**
 * Fetch season stats for a single player by AFL ChampID.
 */
export async function fetchPlayerSeasonStats(playerId: string): Promise<PlayerSeasonStats> {
  const data = await aflFetch<{ player: any }>(`/players/${playerId}/stats?season=2026`);
  const p = data.player;
  return {
    playerId,
    name: `${p.firstName} ${p.surname}`,
    team: p.team?.abbreviation ?? "",
    position: p.position ?? "MID",
    gamesPlayed: p.stats?.gamesPlayed ?? 0,
    avgDisposals: p.stats?.avgDisposals ?? 0,
    avgKicks: p.stats?.avgKicks ?? 0,
    avgHandballs: p.stats?.avgHandballs ?? 0,
    avgGoals: p.stats?.avgGoals ?? 0,
    avgMarks: p.stats?.avgMarks ?? 0,
    togPct: p.stats?.togPercentage ?? 0,
    cbaPct: p.stats?.cbaPct ?? 0,
  };
}

/**
 * Fetch a player's round-by-round stats for recent form.
 */
export async function fetchPlayerRecentForm(playerId: string, rounds = 5): Promise<RoundStat[]> {
  const data = await aflFetch<{ roundStats: any[] }>(`/players/${playerId}/roundStats?season=2026&limit=${rounds}`);
  return data.roundStats.map(r => ({
    round: r.round,
    opponent: r.opponent?.abbreviation ?? "",
    venue: r.venue ?? "",
    disposals: r.disposals ?? 0,
    kicks: r.kicks ?? 0,
    handballs: r.handballs ?? 0,
    goals: r.goals ?? 0,
    marks: r.marks ?? 0,
    tog: r.tog ?? 0,
    cba: r.cba ?? 0,
  }));
}

/**
 * Fetch a team's defence vs position stats.
 */
export async function fetchTeamDvP(teamId: string, position: Position): Promise<DvPData> {
  const data = await aflFetch<{ dvp: any }>(`/teams/${teamId}/dvp?position=${position}&season=2026`);
  const d = data.dvp;
  return {
    teamId,
    teamCode: d.teamCode,
    position,
    avgDisposalsAllowed: d.avgAllowed ?? 0,
    vsLeagueAvg: d.vsLeagueAvg ?? 1.0,
    rank: d.rank ?? 9,
    lastFiveGames: (d.recentGames ?? []).map((g: any) => ({
      round: g.round,
      opponent: g.opponent,
      disposalsAllowed: g.disposalsAllowed,
    })),
  };
}
