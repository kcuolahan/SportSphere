"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import SearchInput from "@/components/ui/SearchInput";
import { getPlayers, getCurrentPredictions } from "@/lib/data";
import { TEAM_COLOURS, getTeamName } from "@/lib/teams";
import { PLAYERS as PLAYERS_FULL } from "@/data/players";
import type { Player } from "@/lib/data";

// Build name → slug map from the full players dataset
const NAME_TO_SLUG = new Map(PLAYERS_FULL.map(p => [p.fullName, p.id]));

const ALL_PLAYERS = getPlayers();
const predictions = getCurrentPredictions();
const featuredPlayers = new Set(predictions.picks.map(p => p.player));
const currentRound = predictions.round;

type Position = "ALL" | "MID" | "DEF" | "FWD" | "RUCK";
type VolTier = "ALL" | "LOW" | "MODERATE" | "HIGH" | "V.HIGH";
type SortOption = "name" | "avg_2026" | "std_dev" | "avg_2025";

const VOL_COLOR: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#f97316",
  HIGH: "#ef4444",
  "V.HIGH": "#a855f7",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "avg_2026", label: "2026 Avg" },
  { value: "avg_2025", label: "2025 Avg" },
  { value: "std_dev", label: "Std Dev" },
  { value: "name", label: "Name" },
];

function TrendIcon({ p }: { p: Player }) {
  const t = p.form_trend ?? (p.avg_2026 - p.avg_2025 > 1.5 ? "UP" : p.avg_2026 - p.avg_2025 < -1.5 ? "DOWN" : "STEADY");
  if (t === "UP") return <span style={{ color: "#22c55e", fontSize: 10 }}>▲</span>;
  if (t === "DOWN") return <span style={{ color: "#ef4444", fontSize: 10 }}>▼</span>;
  return <span style={{ color: "#555", fontSize: 10 }}>—</span>;
}

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

// ── Sparkline component ───────────────────────────────────────────────────────
function Sparkline({ values, avg }: { values: number[]; avg: number }) {
  if (!values.length) return <span style={{ fontSize: 10, color: "#555" }}>—</span>;
  const max = Math.max(...values, avg + 2);
  const min = Math.min(...values, avg - 2);
  const range = max - min || 1;
  const W = 80, H = 28;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const avgY = H - ((avg - min) / range) * H;
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <line x1={0} y1={avgY} x2={W} y2={avgY} stroke="#333" strokeWidth={0.5} strokeDasharray="2,2" />
      <polyline points={pts.join(" ")} fill="none" stroke="#f97316" strokeWidth={1.5} strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = (i / Math.max(values.length - 1, 1)) * W;
        const y = H - ((v - min) / range) * H;
        return <circle key={i} cx={x} cy={y} r={2} fill={v > avg ? "#22c55e" : "#ef4444"} />;
      })}
    </svg>
  );
}

function PlayerDetail({ p }: { p: Player }) {
  const maxAvg = Math.max(...ALL_PLAYERS.map(x => x.avg_2026));
  const pick = predictions.picks.find(pk => pk.player === p.name);
  const slug = NAME_TO_SLUG.get(p.name);

  const median = p.median_disposals ?? p.avg_2026;
  const gamesAboveMedian = p.games_above_median ?? Math.round((p.over_rate ?? 0) * p.games_2026);
  const aboveMedianPct = p.games_2026 > 0 ? Math.round(gamesAboveMedian / p.games_2026 * 100) : 0;

  const last5 = p.last_5 ?? [];

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #111" }}>

      {/* Disposal stats — median, range, above-median rate */}
      <div style={{
        background: "#0a0a0a", border: "1px solid #1f1f1f",
        borderRadius: 8, padding: "12px 14px", marginBottom: 12,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Median</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0f0", lineHeight: 1 }}>{median.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>disp from {p.games_2026} games</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Season Range</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            <span style={{ color: "#ef4444" }}>{p.season_low ?? "—"}</span>
            <span style={{ color: "#555", margin: "0 4px" }}>—</span>
            <span style={{ color: "#22c55e" }}>{p.season_high ?? "—"}</span>
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Low — High this season</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Above Median</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: aboveMedianPct >= 55 ? "#22c55e" : aboveMedianPct >= 45 ? "#f97316" : "#ef4444", lineHeight: 1 }}>
            {aboveMedianPct}%
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{gamesAboveMedian}/{p.games_2026} games</div>
        </div>
      </div>

      {/* Last 5 sparkline */}
      {last5.length > 0 && (
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Last {last5.length}</div>
            <Sparkline values={last5} avg={p.avg_2026} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#888" }}>
              {last5.map((v, i) => (
                <span key={i} style={{
                  marginRight: 4, fontWeight: 700,
                  color: v > p.avg_2026 ? "#22c55e" : "#ef4444",
                }}>{v}</span>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
              {last5.filter(v => v > p.avg_2026).length}/{last5.length} over avg · Avg={p.avg_2026.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Averages bars */}
      <div style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#666", textTransform: "uppercase" }}>2025 Avg</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{p.avg_2025.toFixed(1)}</span>
          </div>
          <BarChart value={p.avg_2025} max={maxAvg} color="#444" />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#f97316", textTransform: "uppercase" }}>2026 Avg</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>{p.avg_2026.toFixed(1)}</span>
          </div>
          <BarChart value={p.avg_2026} max={maxAvg} color="#f97316" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 6, marginBottom: 10 }}>
        {[
          { label: "Games '25", value: p.games_2025 },
          { label: "Games '26", value: p.games_2026 },
          { label: "Std Dev", value: p.std_dev.toFixed(1) },
          { label: "CBA%", value: p.cba_pct > 0 ? `${(p.cba_pct * 100).toFixed(0)}%` : "—" },
          { label: "Avg TOG", value: `${(p.avg_tog * 100).toFixed(0)}%` },
          { label: "Play Style", value: p.play_style },
          { label: "Volatility", value: <span style={{ color: VOL_COLOR[p.volatility_tier] ?? "#888" }}>{p.volatility_tier}</span> },
          { label: "Form Trend", value: <TrendIcon p={p} /> },
        ].map((item, idx) => (
          <div key={idx} style={{ background: "#050505", border: "1px solid #111", borderRadius: 6, padding: "7px 9px" }}>
            <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Round model output */}
      {pick && (
        <div style={{ background: "#0d0800", border: "1px solid #f9731630", borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Round {currentRound} Model Output
          </div>
          Line: <strong style={{ color: "#f0f0f0" }}>{pick.bookie_line}</strong> · Model: <strong style={{ color: "#f97316" }}>{pick.predicted}</strong> · Edge: <strong style={{ color: pick.edge > 0 ? "#22c55e" : "#ef4444" }}>{pick.edge > 0 ? "+" : ""}{pick.edge}</strong> · Direction: <strong style={{ color: pick.direction === "OVER" ? "#22c55e" : "#ef4444" }}>{pick.direction}</strong> · E/V: <strong style={{ color: "#60a5fa" }}>{pick.edge_vol.toFixed(2)}</strong>
        </div>
      )}
      {slug && (
        <div style={{ marginTop: 12 }}>
          <Link href={`/players/${slug}`} onClick={e => e.stopPropagation()} style={{
            display: "inline-block", fontSize: 11, fontWeight: 700,
            color: "#f97316", textDecoration: "none",
            border: "1px solid #f9731640", borderRadius: 6, padding: "5px 12px",
          }}>
            View Full Profile →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState<Position>("ALL");
  const [vol, setVol] = useState<VolTier>("ALL");
  const [team, setTeam] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("avg_2026");
  const [sortDesc, setSortDesc] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const teams = useMemo(() => {
    const codes = [...new Set(ALL_PLAYERS.map(p => p.team))].sort();
    return ["ALL", ...codes];
  }, []);

  const filtered = useMemo(() => {
    const list = ALL_PLAYERS.filter(p => {
      if (pos !== "ALL" && p.position !== pos) return false;
      if (vol !== "ALL" && p.volatility_tier !== vol) return false;
      if (team !== "ALL" && p.team !== team) return false;
      if (search) {
        const s = search.toLowerCase();
        return p.name.toLowerCase().includes(s) || p.team.toLowerCase().includes(s);
      }
      return true;
    });

    return list.sort((a, b) => {
      let av: number | string = sort === "name" ? a.name : (a as unknown as Record<string, number>)[sort];
      let bv: number | string = sort === "name" ? b.name : (b as unknown as Record<string, number>)[sort];
      if (typeof av === "string") {
        return sortDesc ? (bv as string).localeCompare(av) : av.localeCompare(bv as string);
      }
      return sortDesc ? (bv as number) - av : av - (bv as number);
    });
  }, [search, pos, vol, team, sort, sortDesc]);

  const positions: Position[] = ["ALL", "MID", "DEF", "FWD", "RUCK"];
  const volTiers: VolTier[] = ["ALL", "LOW", "MODERATE", "HIGH", "V.HIGH"];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Player Database
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Player Explorer
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            {ALL_PLAYERS.length} players tracked in the model. Click any card for their full model profile.
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by player name or team..." />
        </div>

        {/* Filters row 1: position + volatility */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {positions.map(p => (
              <button key={p} onClick={() => setPos(p)} style={{
                padding: "5px 11px", borderRadius: 5,
                border: pos === p ? "1px solid #f97316" : "1px solid #111",
                background: pos === p ? "#f97316" : "#0a0a0a",
                color: pos === p ? "#000" : "#555",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {volTiers.map(v => (
              <button key={v} onClick={() => setVol(v)} style={{
                padding: "5px 11px", borderRadius: 5,
                border: vol === v ? `1px solid ${v === "ALL" ? "#f97316" : VOL_COLOR[v] || "#f97316"}` : "1px solid #111",
                background: vol === v ? (v === "ALL" ? "#f97316" : VOL_COLOR[v] + "22") : "#0a0a0a",
                color: vol === v ? (v === "ALL" ? "#000" : VOL_COLOR[v]) : "#555",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>{v === "ALL" ? "All Vol" : v}</button>
            ))}
          </div>
        </div>

        {/* Filters row 2: team + sort */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
          <select
            value={team}
            onChange={e => setTeam(e.target.value)}
            style={{
              background: "#0a0a0a", border: "1px solid #111",
              borderRadius: 6, padding: "6px 12px",
              fontSize: 11, color: team === "ALL" ? "#555" : "#f0f0f0",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Teams</option>
            {teams.filter(t => t !== "ALL").map(t => (
              <option key={t} value={t}>{getTeamName(t)} ({t})</option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 4, marginLeft: "auto", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#555", marginRight: 4 }}>Sort:</span>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => {
                if (sort === opt.value) setSortDesc(d => !d);
                else { setSort(opt.value); setSortDesc(true); }
              }} style={{
                padding: "4px 10px", borderRadius: 5,
                border: sort === opt.value ? "1px solid #f97316" : "1px solid #111",
                background: sort === opt.value ? "#f9731615" : "#0a0a0a",
                color: sort === opt.value ? "#f97316" : "#555",
                fontSize: 10, fontWeight: 600, cursor: "pointer",
              }}>
                {opt.label} {sort === opt.value ? (sortDesc ? "↓" : "↑") : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ fontSize: 11, color: "#555", marginBottom: 12 }}>
          {filtered.length} player{filtered.length !== 1 ? "s" : ""} shown
          {featuredPlayers.size > 0 && (
            <span style={{ marginLeft: 8, color: "#f97316" }}>
              · {filtered.filter(p => featuredPlayers.has(p.name)).length} featured in Round {currentRound} picks
            </span>
          )}
        </div>

        {/* Player cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((p: Player) => {
            const isFeatured = featuredPlayers.has(p.name);
            const isOpen = expanded === p.name;
            return (
              <div
                key={p.name}
                onClick={() => setExpanded(isOpen ? null : p.name)}
                style={{
                  background: isFeatured ? "#0d0800" : "#080808",
                  border: isFeatured ? "1px solid #f9731630" : "1px solid #111",
                  borderRadius: 10, padding: "13px 16px",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                }}
              >
                {isFeatured && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#f97316" }} />}

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: isFeatured ? 8 : 0, flexWrap: "wrap" }}>
                  <PlayerAvatar name={p.name} team={p.team} size={40} />

                  {/* Name + team */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.name}</span>
                      {isFeatured && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: "#f97316",
                          background: "#1a0f00", border: "1px solid #f9731640",
                          borderRadius: 4, padding: "1px 6px", letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}>
                          R{currentRound} Pick
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>{getTeamName(p.team)} · {p.position} · {p.play_style}</div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>2025</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#666" }}>{p.avg_2025.toFixed(1)}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>2026</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>
                        {p.avg_2026.toFixed(1)} <TrendIcon p={p} />
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>Vol</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: VOL_COLOR[p.volatility_tier] ?? "#888" }}>
                        {p.volatility_tier}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>σ</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{p.std_dev.toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                {isOpen && <PlayerDetail p={p} />}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#555", fontSize: 13 }}>
              No players match your filters.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
