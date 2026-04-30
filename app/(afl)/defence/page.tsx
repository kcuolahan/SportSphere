"use client";

import { useState, useMemo, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getTeamStyle, getCurrentPredictions, getPlayers } from "@/lib/data";
import { useProAccess } from "@/lib/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { Team, TeamPosition, Pick } from "@/lib/data";

const TEAMS = getTeamStyle();
const predictions = getCurrentPredictions();
const currentPicks = predictions.picks.filter(p => p.filter_pass);
const allPlayers = getPlayers();

type Position = "MID" | "DEF" | "FWD" | "RUCK";
type SortKey = "name" | "MID" | "DEF" | "FWD" | "RUCK" | "disposal_index";
type ViewMode = "table" | "heatmap";

// ── Sub-position classification from play_style ───────────────────────────────
type SubPos =
  | "MID Inside"   // STOP + MID (contested)
  | "MID Outside"  // TRANS + MID (run and carry)
  | "DEF Ball User" // TRANS + DEF
  | "DEF General"  // STOP + DEF
  | "FWD General"  // FWD + high CBA%
  | "FWD Key";     // FWD + low CBA%

function getSubPosition(position: string, play_style: string, cba_pct?: number): SubPos | null {
  if (position === "MID") {
    return play_style === "STOP" ? "MID Inside" : play_style === "TRANS" ? "MID Outside" : null;
  }
  if (position === "DEF") {
    return play_style === "TRANS" ? "DEF Ball User" : play_style === "STOP" ? "DEF General" : null;
  }
  if (position === "FWD") {
    return (cba_pct ?? 0) > 0.15 ? "FWD General" : "FWD Key";
  }
  return null;
}

function getPlayerSubPos(pick: Pick): SubPos | null {
  const player = allPlayers.find(p => p.name === pick.player);
  const play_style = player?.play_style ?? pick.play_style ?? "HYBRID";
  const cba_pct = player?.cba_pct ?? pick.cba_pct ?? 0;
  return getSubPosition(pick.position, play_style, cba_pct);
}

// ── Trend indicator ───────────────────────────────────────────────────────────
// Derived from vs_league: teams consistently above 1.05 are "conceding more" ↑
function getTrend(vs_league: number, games: number): "↑" | "↓" | "→" {
  if (games < 4) return "→";
  if (vs_league > 1.06) return "↑";
  if (vs_league < 0.94) return "↓";
  return "→";
}

// ── Rank computation ──────────────────────────────────────────────────────────
function computeRanks() {
  const positions: Position[] = ["MID", "DEF", "FWD", "RUCK"];
  const ranks: Record<string, Record<Position, number>> = {};
  for (const pos of positions) {
    const sorted = [...TEAMS].sort((a, b) =>
      (b.concedes_by_position[pos]?.vs_league ?? 1) - (a.concedes_by_position[pos]?.vs_league ?? 1)
    );
    sorted.forEach((team, i) => {
      if (!ranks[team.code]) ranks[team.code] = {} as Record<Position, number>;
      ranks[team.code][pos] = i + 1;
    });
  }
  return ranks;
}
const RANKS = computeRanks();

// ── Range-based heat map ──────────────────────────────────────────────────────
function getRanges() {
  const positions: Position[] = ["MID", "DEF", "FWD", "RUCK"];
  const ranges: Record<string, { min: number; max: number }> = {};
  for (const pos of positions) {
    const vals = TEAMS.map(t => t.concedes_by_position[pos]?.vs_league ?? 1).filter(v => isFinite(v));
    ranges[pos] = { min: vals.length ? Math.min(...vals) : 0.9, max: vals.length ? Math.max(...vals) : 1.1 };
  }
  return ranges;
}
const RANGES = getRanges();

function heatColor(vs_league: number, pos: string): string {
  const { min, max } = RANGES[pos] ?? { min: 0.9, max: 1.1 };
  const mid = 1.0;
  if (vs_league >= mid) {
    const t = Math.min((vs_league - mid) / (max - mid), 1);
    return `rgba(239,68,68,${(t * 0.28).toFixed(3)})`;
  } else {
    const t = Math.min((mid - vs_league) / (mid - min), 1);
    return `rgba(34,197,94,${(t * 0.22).toFixed(3)})`;
  }
}

function heatTextColor(vs_league: number): string {
  if (vs_league >= 1.10) return "#ef4444";
  if (vs_league >= 1.05) return "#f97316";
  if (vs_league <= 0.92) return "#22c55e";
  if (vs_league <= 0.97) return "#4ade80";
  return "#888";
}

function rankBadge(rank: number) {
  const color = rank <= 6 ? "#22c55e" : rank >= 13 ? "#ef4444" : "#555";
  const bg = rank <= 6 ? "rgba(34,197,94,0.1)" : rank >= 13 ? "rgba(239,68,68,0.08)" : "#0a0a0a";
  return (
    <span style={{ fontSize: 9, fontWeight: 800, color, background: bg, border: `1px solid ${color}40`, borderRadius: 3, padding: "1px 5px", marginLeft: 4 }}>
      #{rank}
    </span>
  );
}

// ── Table cell with trend + sample warning ────────────────────────────────────
function Cell({ pos, posKey, rank }: { pos: TeamPosition | undefined; posKey: string; rank: number }) {
  if (!pos) return <td style={{ padding: "11px 14px", borderRight: "1px solid #0a0a0a" }}><span style={{ fontSize: 10, color: "#555" }}>-</span></td>;
  const lowN = pos.games < 4;
  const trend = getTrend(pos.vs_league, pos.games);
  const trendColor = trend === "↑" ? "#ef4444" : trend === "↓" ? "#22c55e" : "#555";

  return (
    <td style={{ padding: "11px 14px", background: heatColor(pos.vs_league, posKey), borderRight: "1px solid #0a0a0a" }}>
      {lowN ? (
        <div>
          <span style={{ fontSize: 10, color: "#555", background: "#111", border: "1px solid #222", borderRadius: 3, padding: "2px 6px", fontWeight: 600 }}>
            LOW n ({pos.games}g)
          </span>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: heatTextColor(pos.vs_league) }}>
              {pos.avg.toFixed(1)}
            </span>
            {rankBadge(rank)}
            <span style={{ fontSize: 11, color: trendColor, marginLeft: 2 }} title="Recent trend vs season avg">{trend}</span>
          </div>
          <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
            {pos.vs_league >= 1 ? "+" : ""}{((pos.vs_league - 1) * 100).toFixed(0)}% vs avg
          </div>
        </>
      )}
    </td>
  );
}

// ── Heatmap view ──────────────────────────────────────────────────────────────
function HeatmapView({ teams, posFilter }: { teams: Team[]; posFilter: "ALL" | Position }) {
  const positions: Position[] = posFilter === "ALL" ? ["MID", "DEF", "FWD", "RUCK"] : [posFilter];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr style={{ background: "#080808" }}>
            <th style={{ padding: "8px 14px", fontSize: 10, color: "#666", textAlign: "left", fontWeight: 600, letterSpacing: "0.06em" }}>TEAM</th>
            {positions.map(p => (
              <th key={p} style={{ padding: "8px 14px", fontSize: 10, color: "#666", textAlign: "center", fontWeight: 600, letterSpacing: "0.06em" }}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.code} style={{ borderBottom: "1px solid #0a0a0a" }}>
              <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#f0f0f0", whiteSpace: "nowrap" }}>{team.name}</td>
              {positions.map(pos => {
                const posData = team.concedes_by_position[pos];
                if (!posData) return <td key={pos} style={{ padding: "10px 18px", textAlign: "center" }}><div style={{ fontSize: 9, color: "#444" }}>-</div></td>;
                const rank = RANKS[team.code]?.[pos] ?? 9;
                const lowN = posData.games < 4;
                const trend = getTrend(posData.vs_league, posData.games);
                const trendColor = trend === "↑" ? "#ef4444" : trend === "↓" ? "#22c55e" : "#555";
                return (
                  <td key={pos} style={{ padding: "10px 18px", background: heatColor(posData.vs_league, pos), textAlign: "center" }}>
                    {lowN ? (
                      <div style={{ fontSize: 9, color: "#444" }}>LOW n</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: heatTextColor(posData.vs_league) }}>#{rank}</div>
                        <div style={{ fontSize: 9, color: trendColor }}>{trend}</div>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Matchup card ──────────────────────────────────────────────────────────────
function MatchupCard({ pick, rank }: { pick: Pick; rank: number }) {
  const oppTeam = TEAMS.find(t => t.code === pick.opponent);
  const concession = oppTeam?.concedes_by_position[pick.position as Position];
  const diff = concession ? concession.vs_league - 1 : 0;
  const isPositive = diff > 0.02;
  const isNegative = diff < -0.02;
  const subPos = getPlayerSubPos(pick);

  return (
    <div style={{
      background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 16px",
      borderLeft: rank <= 3 ? "2px solid #22c55e" : rank <= 6 ? "2px solid #f97316" : "2px solid #1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <PlayerAvatar name={pick.player} team={pick.team} size={36} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{pick.player}</div>
          <div style={{ fontSize: 10, color: "#555" }}>
            {pick.team} vs {pick.opponent} · {pick.position}
            {subPos && (
              <span style={{ marginLeft: 6, fontSize: 9, color: "#888", background: "#111", border: "1px solid #222", borderRadius: 3, padding: "1px 5px" }}>
                {subPos}
              </span>
            )}
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: pick.direction === "OVER" ? "#22c55e" : "#ef4444" }}>
            {pick.direction} {pick.bookie_line}
          </div>
          <div style={{ fontSize: 9, color: "#555" }}>E/V {pick.edge_vol.toFixed(2)} · DvP #{rank}</div>
        </div>
      </div>
      {concession && (
        <div style={{
          fontSize: 11, lineHeight: 1.6,
          color: isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#555",
          background: isPositive ? "rgba(34,197,94,0.06)" : isNegative ? "rgba(239,68,68,0.06)" : "#050505",
          border: `1px solid ${isPositive ? "rgba(34,197,94,0.2)" : isNegative ? "rgba(239,68,68,0.2)" : "#111"}`,
          borderRadius: 6, padding: "6px 10px",
        }}>
          {pick.opponent} concede <strong>{isPositive ? "+" : ""}{(diff * 100).toFixed(0)}%</strong> vs league avg to {pick.position}s
          {isPositive ? " - favourable OVER matchup" : isNegative ? " - tough matchup" : " - neutral matchup"}
          {concession.games < 4 && <span style={{ color: "#555", marginLeft: 6 }}>(low sample - {concession.games}g)</span>}
        </div>
      )}
    </div>
  );
}

// ── Best matchups panel ───────────────────────────────────────────────────────
function BestMatchupsPanel() {
  const dvpPlusPicks = currentPicks
    .filter(pick => {
      const rank = RANKS[pick.opponent]?.[pick.position as Position];
      return rank !== undefined && rank <= 6;
    })
    .sort((a, b) => {
      const ra = RANKS[a.opponent]?.[a.position as Position] ?? 18;
      const rb = RANKS[b.opponent]?.[b.position as Position] ?? 18;
      return ra - rb || b.edge_vol - a.edge_vol;
    });

  if (!dvpPlusPicks.length) {
    return <div style={{ padding: "20px 0", fontSize: 13, color: "#555" }}>No picks this round combine top-6 DvP with the E/V filter.</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
      {dvpPlusPicks.map(pick => {
        const rank = RANKS[pick.opponent]?.[pick.position as Position] ?? 18;
        return <MatchupCard key={pick.player} pick={pick} rank={rank} />;
      })}
    </div>
  );
}

// ── Sub-position legend panel ─────────────────────────────────────────────────
function SubPositionGuide() {
  const guide: { sub: SubPos; desc: string; style: string }[] = [
    { sub: "MID Inside", style: "STOP", desc: "Contested midfielders - high CBA, inside 50s" },
    { sub: "MID Outside", style: "TRANS", desc: "Run-and-carry - transition chains, high disposals" },
    { sub: "DEF Ball User", style: "TRANS", desc: "Intercept markers, rebounders - disposal hungry" },
    { sub: "DEF General", style: "STOP", desc: "Role defenders, taggers - lower disposal volume" },
    { sub: "FWD General", style: "HIGH CBA%", desc: "Crumbing forwards - work rate dependent" },
    { sub: "FWD Key", style: "LOW CBA%", desc: "Marking targets - disposal count volatile" },
  ];
  return (
    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 700 }}>
        Sub-Position Classification Guide
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
        {guide.map(g => (
          <div key={g.sub} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#f97316", background: "#1a0800", border: "1px solid #f9731640", borderRadius: 3, padding: "2px 6px", whiteSpace: "nowrap", marginTop: 1 }}>
              {g.sub}
            </span>
            <div>
              <span style={{ fontSize: 10, color: "#666" }}>{g.style} · </span>
              <span style={{ fontSize: 10, color: "#555" }}>{g.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pro gate teaser ───────────────────────────────────────────────────────────
function DvPGate() {
  const previewTeams = TEAMS.slice(0, 3);
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "84px 20px 60px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Defence vs Position</div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>DvP Rankings</h1>
          <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 8, padding: "14px 16px", maxWidth: 680 }}>
            <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.7 }}>
              Teams in <span style={{ color: "#ef4444" }}>red concede more</span> - good OVER targets.
              Teams in <span style={{ color: "#22c55e" }}>green concede fewer</span> - tilt toward UNDERs.
              See which teams are leaking disposals to each position.
            </p>
          </div>
        </div>

        {/* Blurred teaser */}
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none", opacity: 0.6 }}>
            <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #111" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#080808", borderBottom: "1px solid #111" }}>
                    {["Team", "MID Avg", "DEF Avg", "FWD Avg", "RUCK Avg", "Disposal Index"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 10, color: "#666", fontWeight: 600, textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewTeams.map((team, i) => (
                    <tr key={team.code} style={{ borderBottom: "1px solid #0a0a0a", background: i % 2 === 0 ? "#050505" : "#000" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{team.name}</div>
                        <div style={{ fontSize: 10, color: "#555" }}>{team.code}</div>
                      </td>
                      {(["MID", "DEF", "FWD", "RUCK"] as Position[]).map(pos => {
                        const posData = team.concedes_by_position[pos];
                        if (!posData) return <td key={pos} style={{ padding: "11px 14px" }}><span style={{ fontSize: 10, color: "#555" }}>-</span></td>;
                        return (
                          <td key={pos} style={{ padding: "11px 14px", background: heatColor(posData.vs_league, pos) }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: heatTextColor(posData.vs_league) }}>
                              {posData.avg.toFixed(1)}
                            </div>
                            <div style={{ fontSize: 9, color: "#666" }}>
                              {posData.vs_league >= 1 ? "+" : ""}{((posData.vs_league - 1) * 100).toFixed(0)}% vs avg
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: team.disposal_index > 30 ? "#f97316" : team.disposal_index < -30 ? "#60a5fa" : "#555" }}>
                          {team.disposal_index > 0 ? "+" : ""}{team.disposal_index}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gate overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 50%, #000 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
            paddingBottom: 32,
          }}>
            <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
              <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Pro Feature</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f0f0", marginBottom: 8, letterSpacing: "-0.02em" }}>DvP Rankings</div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
                See which teams concede most to each position - the edge behind every pick.
              </div>
              <a href="/auth/payment" style={{
                display: "inline-block", background: "#f97316", color: "#000",
                fontWeight: 800, fontSize: 14, borderRadius: 8, padding: "12px 32px",
                textDecoration: "none",
              }}>
                Unlock DvP - $29/month
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
interface LivePick {
  id: string; player_name: string; team: string; position: string;
  line: number; prediction: string; edge_vol: number; tier: string;
}

export default function DefencePage() {
  const { isPro, loading: proLoading } = useProAccess();
  const [currentRound, setCurrentRound] = useState(8);
  const [keyMatchups, setKeyMatchups] = useState<LivePick[]>([]);
  const [posFilter, setPosFilter] = useState<"ALL" | Position>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("MID");

  useEffect(() => {
    async function fetchData() {
      try {
        const roundRes = await fetch('/api/current-round');
        const roundData = await roundRes.json();
        const r = roundData.round || 8;
        setCurrentRound(r);

        const picksRes = await fetch(`/api/picks?round=${r}&tier=HC`);
        const picksData = await picksRes.json();
        setKeyMatchups((picksData.picks || []).slice(0, 6));
      } catch {}
    }
    fetchData();
  }, []);
  const [sortDesc, setSortDesc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showBestMatchups, setShowBestMatchups] = useState(false);
  const [showSubPosGuide, setShowSubPosGuide] = useState(false);

  const sorted = useMemo(() => {
    return [...TEAMS].sort((a, b) => {
      if (sortKey === "name") {
        return sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      const av = sortKey === "disposal_index" ? a.disposal_index : a.concedes_by_position[sortKey]?.vs_league ?? 1;
      const bv = sortKey === "disposal_index" ? b.disposal_index : b.concedes_by_position[sortKey]?.vs_league ?? 1;
      return sortDesc ? bv - av : av - bv;
    });
  }, [sortKey, sortDesc]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDesc(d => !d);
    else { setSortKey(key); setSortDesc(true); }
  }

  if (!proLoading && !isPro) return <ErrorBoundary><DvPGate /></ErrorBoundary>;

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th onClick={() => handleSort(k)} style={{
        padding: "10px 14px", fontSize: 10,
        color: active ? "#f97316" : "#666",
        fontWeight: 600, textAlign: "left",
        letterSpacing: "0.06em", textTransform: "uppercase",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
      }}>
        {label} {active ? (sortDesc ? "↓" : "↑") : ""}
      </th>
    );
  }

  const posButtons: ("ALL" | Position)[] = ["ALL", "MID", "DEF", "FWD", "RUCK"];
  const dvpValueCount = currentPicks.filter(p => {
    const rank = RANKS[p.opponent]?.[p.position as Position];
    return rank !== undefined && rank <= 6;
  }).length;

  return (
    <ErrorBoundary>
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Defence vs Position</div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>DvP Rankings</h1>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>
            Disposal concession data through Round {currentRound - 1}, used to inform Round {currentRound} picks.
          </p>
          <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 8, padding: "14px 16px", maxWidth: 680 }}>
            <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.7 }}>
              Teams in <span style={{ color: "#ef4444" }}>red concede more</span> - good OVER targets.
              Teams in <span style={{ color: "#22c55e" }}>green concede fewer</span> - tilt toward UNDERs.
              <strong style={{ color: "#888" }}> ↑↓→</strong> trend vs season avg.
              <span style={{ color: "#555" }}> LOW n = fewer than 4 games sampled.</span>
            </p>
          </div>
        </div>

        {/* Best Matchups + Sub-pos guide buttons */}
        <div style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setShowBestMatchups(v => !v)} style={{
            background: showBestMatchups ? "#f97316" : "#0a0800",
            border: "1px solid #f97316", borderRadius: 8, padding: "10px 18px",
            fontSize: 12, fontWeight: 700, color: showBestMatchups ? "#000" : "#f97316", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            Find Best Matchups This Round
            {dvpValueCount > 0 && !showBestMatchups && (
              <span style={{ fontSize: 10, background: "#f97316", color: "#000", borderRadius: 10, padding: "1px 7px", fontWeight: 800 }}>{dvpValueCount}</span>
            )}
          </button>
          <button onClick={() => setShowSubPosGuide(v => !v)} style={{
            background: "#0a0a0a", border: "1px solid #333", borderRadius: 8, padding: "10px 18px",
            fontSize: 12, fontWeight: 700, color: "#666", cursor: "pointer",
          }}>
            Sub-Position Guide
          </button>
        </div>

        {showSubPosGuide && <SubPositionGuide />}

        {showBestMatchups && (
          <div style={{ marginBottom: 24, padding: 16, background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Round {predictions.round} · DvP + Value picks (top-6 matchup + E/V filter)
            </div>
            <BestMatchupsPanel />
          </div>
        )}

        {/* Key matchups — live from current round */}
        {keyMatchups.length > 0 && !showBestMatchups && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Round {currentRound} · Key Matchups
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
              {keyMatchups.map(pick => {
                const initials = pick.player_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('');
                const isOver = pick.prediction === 'OVER';
                const accentColor = isOver ? '#4ade80' : '#f87171';
                return (
                  <div key={pick.id} style={{
                    background: '#080808',
                    border: `1px solid ${isOver ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    borderLeft: `3px solid ${accentColor}`,
                    borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: '#0a0a0a', border: '1px solid #2a2a2a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: '#f97316', flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: 2 }}>
                          {pick.player_name}
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                          {pick.team} · {pick.position}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: accentColor }}>
                          {pick.prediction} {pick.line}
                        </div>
                        <div style={{ fontSize: 10, color: '#555' }}>
                          E/V {pick.edge_vol?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {posButtons.map(p => (
              <button key={p} onClick={() => setPosFilter(p)} style={{
                padding: "6px 14px", borderRadius: 6,
                border: posFilter === p ? "1px solid #f97316" : "1px solid #111",
                background: posFilter === p ? "#f97316" : "#0a0a0a",
                color: posFilter === p ? "#000" : "#555",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 0, border: "1px solid #111", borderRadius: 6, overflow: "hidden" }}>
              {(["table", "heatmap"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  padding: "5px 12px", fontSize: 10, fontWeight: 700, cursor: "pointer",
                  background: viewMode === v ? "#f97316" : "#0a0a0a",
                  color: viewMode === v ? "#000" : "#555", border: "none",
                  textTransform: "capitalize",
                }}>{v}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ color: "rgba(239,68,68,0.28)", label: "OVER" }, { color: "rgba(34,197,94,0.22)", label: "UNDER" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 9, color: "#555" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {viewMode === "heatmap" && (
          <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
            <HeatmapView teams={sorted} posFilter={posFilter} />
          </div>
        )}

        {viewMode === "table" && (
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #111" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#080808", borderBottom: "1px solid #111" }}>
                  <SortHeader label="Team" k="name" />
                  {(posFilter === "ALL" || posFilter === "MID") && <SortHeader label="MID Avg" k="MID" />}
                  {(posFilter === "ALL" || posFilter === "DEF") && <SortHeader label="DEF Avg" k="DEF" />}
                  {(posFilter === "ALL" || posFilter === "FWD") && <SortHeader label="FWD Avg" k="FWD" />}
                  {(posFilter === "ALL" || posFilter === "RUCK") && <SortHeader label="RUCK Avg" k="RUCK" />}
                  <SortHeader label="Disposal Index" k="disposal_index" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((team: Team, i: number) => (
                  <tr key={team.code} style={{ borderBottom: "1px solid #0a0a0a", background: i % 2 === 0 ? "#050505" : "#000" }}>
                    <td style={{ padding: "12px 14px", borderRight: "1px solid #0a0a0a" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{team.name}</div>
                      <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{team.code}</div>
                    </td>
                    {(posFilter === "ALL" || posFilter === "MID") && (
                      <Cell pos={team.concedes_by_position.MID} posKey="MID" rank={RANKS[team.code]?.MID ?? 9} />
                    )}
                    {(posFilter === "ALL" || posFilter === "DEF") && (
                      <Cell pos={team.concedes_by_position.DEF} posKey="DEF" rank={RANKS[team.code]?.DEF ?? 9} />
                    )}
                    {(posFilter === "ALL" || posFilter === "FWD") && (
                      <Cell pos={team.concedes_by_position.FWD} posKey="FWD" rank={RANKS[team.code]?.FWD ?? 9} />
                    )}
                    {(posFilter === "ALL" || posFilter === "RUCK") && (
                      <Cell pos={team.concedes_by_position.RUCK} posKey="RUCK" rank={RANKS[team.code]?.RUCK ?? 9} />
                    )}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: team.disposal_index > 30 ? "#f97316" : team.disposal_index < -30 ? "#60a5fa" : "#555",
                      }}>
                        {team.disposal_index > 0 ? "+" : ""}{team.disposal_index}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 11, color: "#555" }}>
          Data sampled from Rounds 2 to {currentRound - 1} of 2026 season. Rankings reflect disposals conceded to each position vs season averages.
          Refreshed every Monday after weekend results. Rank #1-6 = easy matchup (green). Rank #13-18 = hard (red).
          LOW n = &lt;4 games - insufficient sample to act on.
        </div>
      </div>
      <Footer />

    </div>
    </ErrorBoundary>
  );
}
