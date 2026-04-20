"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PLAYERS } from "@/data/players";
import resultsData from "@/data/results.json";

// ── Build comprehensive historical picks ──────────────────────────────────────
interface HistoricalPick {
  round: number;
  player: string;
  playerSlug: string;
  team: string;
  opponent: string;
  position: "MID" | "DEF" | "FWD" | "RUCK";
  venue: string;
  line: number;
  model: number;
  edge: number;
  ev: number;
  tier: "HC" | "BET" | "SKIP";
  direction: "OVER" | "UNDER";
  result: "WIN" | "LOSS";
  disposals: number;
  imageUrl: string;
}

const ALL_PICKS: HistoricalPick[] = PLAYERS.flatMap(player =>
  player.historicalRounds.map(h => {
    const edge = Math.round((player.stats.model - h.line) * 10) / 10;
    const ev = player.stdDev > 0 ? Math.round(Math.abs(edge) / player.stdDev * 1000) / 1000 : 0;
    const direction: "OVER" | "UNDER" = edge >= 0 ? "OVER" : "UNDER";
    const tier: "HC" | "BET" | "SKIP" = ev >= 0.90 ? "HC" : ev >= 0.50 ? "BET" : "SKIP";
    return {
      round: h.round,
      player: player.fullName,
      playerSlug: player.id,
      team: player.team,
      opponent: player.opponent,
      position: player.position,
      venue: player.venue,
      line: h.line,
      model: Math.round(player.stats.model * 10) / 10,
      edge,
      ev,
      tier,
      direction,
      result: h.result,
      disposals: h.disposals,
      imageUrl: player.imageUrl,
    };
  })
).sort((a, b) => a.round - b.round || a.player.localeCompare(b.player));

const ROUNDS = [...new Set(ALL_PICKS.map(p => p.round))].sort();
const SEASON_SUMMARY = resultsData.season_summary;
const FLAT_ODDS = 1.90;

// ── ROI SVG chart ─────────────────────────────────────────────────────────────
function ROIChart({ picks }: { picks: HistoricalPick[] }) {
  const sorted = [...picks].sort((a, b) => a.round - b.round);
  const allSeries: number[] = [0];
  const hcSeries: number[] = [0];
  let hcCursor = 0;

  sorted.forEach(p => {
    const gain = p.result === "WIN" ? FLAT_ODDS - 1 : -1;
    allSeries.push(allSeries[allSeries.length - 1] + gain);
    if (p.tier === "HC") {
      hcCursor += gain;
    }
    hcSeries.push(hcCursor);
  });

  const W = 800, H = 180, PL = 40, PR = 20, PT = 16, PB = 28;
  const cw = W - PL - PR, ch = H - PT - PB;
  const n = allSeries.length;
  const allVals = [...allSeries, ...hcSeries];
  const minY = Math.min(...allVals, -0.5);
  const maxY = Math.max(...allVals, 0.5);
  const range = maxY - minY;

  const fx = (i: number) => PL + (i / (n - 1)) * cw;
  const fy = (v: number) => PT + (1 - (v - minY) / range) * ch;

  const allPath = allSeries.map((v, i) => `${i === 0 ? "M" : "L"}${fx(i).toFixed(1)},${fy(v).toFixed(1)}`).join(" ");
  const hcPath = hcSeries.map((v, i) => `${i === 0 ? "M" : "L"}${fx(i).toFixed(1)},${fy(v).toFixed(1)}`).join(" ");
  const zero = fy(0);

  // X-axis round labels
  const roundMarks = ROUNDS.map(r => {
    const firstIdx = sorted.findIndex(p => p.round === r);
    return { r, x: firstIdx >= 0 ? fx(firstIdx + 1) : null };
  });

  return (
    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "16px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Cumulative P&L (flat $1 @ {FLAT_ODDS} odds)
        </span>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ color: "#f97316", label: "HC only" }, { color: "#555", label: "All picks" }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 16, height: 2, background: l.color, borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "#666" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Y-axis labels */}
        {[minY, 0, maxY].map(v => (
          <g key={v}>
            <line x1={PL} y1={fy(v)} x2={W - PR} y2={fy(v)} stroke="#111" strokeWidth={v === 0 ? 1.5 : 0.5} strokeDasharray={v === 0 ? "0" : "3,3"} />
            <text x={PL - 5} y={fy(v) + 4} fontSize={8} fill="#555" textAnchor="end">{v >= 0 ? "+" : ""}{v.toFixed(1)}</text>
          </g>
        ))}
        {/* Round markers */}
        {roundMarks.map(({ r, x }) => x !== null && (
          <g key={r}>
            <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#111" strokeWidth={0.5} strokeDasharray="2,4" />
            <text x={x} y={H - 4} fontSize={8} fill="#555" textAnchor="middle">R{r}</text>
          </g>
        ))}
        {/* All picks line */}
        <path d={allPath} fill="none" stroke="#555" strokeWidth={1.5} />
        {/* HC line */}
        <path d={hcPath} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" />
        {/* Zero line label */}
        <text x={W - PR + 3} y={zero + 4} fontSize={8} fill="#666">0</text>
        {/* Final values */}
        <circle cx={fx(n - 1)} cy={fy(allSeries[n - 1])} r={3} fill="#666" />
        <circle cx={fx(hcSeries.length - 1)} cy={fy(hcSeries[hcSeries.length - 1])} r={3} fill="#f97316" />
      </svg>
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function PickDrawer({ pick, onClose }: { pick: HistoricalPick; onClose: () => void }) {
  const absError = Math.abs(pick.model - pick.disposals);
  const resultCorrect = (pick.direction === "OVER" && pick.disposals > pick.line) || (pick.direction === "UNDER" && pick.disposals < pick.line);

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 400,
        width: 380, maxWidth: "90vw",
        background: "#0a0a0a", borderLeft: "1px solid #1a1a1a",
        overflowY: "auto", padding: 24,
        animation: "slideIn 0.2s ease",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18,
        }}>✕</button>

        {/* Player header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <PlayerAvatar name={pick.player} team={pick.team} size={56} imageUrl={pick.imageUrl || undefined} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f0f0" }}>{pick.player}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{pick.team} · {pick.position} · Round {pick.round}</div>
          </div>
        </div>

        {/* Result banner */}
        <div style={{
          borderRadius: 8, padding: "12px 14px", marginBottom: 18,
          background: pick.result === "WIN" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${pick.result === "WIN" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: pick.result === "WIN" ? "#22c55e" : "#ef4444" }}>
            {pick.result === "WIN" ? "✓ WIN" : "✗ LOSS"}
          </span>
          <span className={pick.tier === "HC" ? "badge-hc" : undefined} style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            background: pick.tier === "HC" ? "#f97316" : pick.tier === "BET" ? "#3b82f6" : "#333",
            color: "#000",
          }}>{pick.tier}</span>
        </div>

        {/* Pick details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Line", value: pick.line },
            { label: "Disposals", value: pick.disposals, highlight: true },
            { label: "Model", value: pick.model },
            { label: "Edge", value: `${pick.edge >= 0 ? "+" : ""}${pick.edge}` },
            { label: "E/V", value: pick.ev.toFixed(3) },
            { label: "Direction", value: pick.direction },
          ].map(({ label, value, highlight }) => (
            <div key={label} style={{ background: "#111", borderRadius: 6, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: highlight ? "#f0f0f0" : "#888" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Model accuracy */}
        <div style={{ background: "#111", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Model Accuracy
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#555" }}>Absolute Error</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: absError <= 3 ? "#22c55e" : absError <= 6 ? "#f97316" : "#ef4444" }}>
              {absError.toFixed(1)} disposals
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#555" }}>Direction correct</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: resultCorrect ? "#22c55e" : "#ef4444" }}>
              {resultCorrect ? "Yes ✓" : "No ✗"}
            </span>
          </div>
        </div>

        {/* Context */}
        <div style={{ background: "#111", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Context</div>
          {[
            { label: "Venue", value: pick.venue },
            { label: "vs", value: pick.opponent },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#555" }}>{label}</span>
              <span style={{ fontSize: 12, color: "#888" }}>{value}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/players/${pick.playerSlug}`}
          style={{
            display: "block", textAlign: "center",
            background: "#f97316", color: "#000",
            borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700,
            textDecoration: "none", marginBottom: 8,
          }}
        >
          View Full Player Profile →
        </Link>
        <button onClick={onClose} style={{
          width: "100%", background: "none", border: "1px solid #1a1a1a",
          borderRadius: 8, padding: "8px", fontSize: 11, color: "#555", cursor: "pointer",
        }}>
          Close
        </button>
      </div>
    </>
  );
}

// ── Win rate animated arc ─────────────────────────────────────────────────────
function WinRateArc({ rate }: { rate: number }) {
  const R = 22, C = 2 * Math.PI * R;
  const color = rate >= 58 ? "#22c55e" : rate >= 52 ? "#f97316" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 54, height: 54, flexShrink: 0 }}>
      <svg width={54} height={54} viewBox="0 0 54 54" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={27} cy={27} r={R} fill="none" stroke="#1a1a1a" strokeWidth={4} />
        <circle
          cx={27} cy={27} r={R} fill="none"
          stroke={color} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (rate / 100) * C}
          style={{ animation: "arcFill 0.9s ease-out both" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, color, lineHeight: 1 }}>{rate}%</span>
      </div>
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ picks, isFullDataset }: { picks: HistoricalPick[]; isFullDataset?: boolean }) {
  const hc = picks.filter(p => p.tier === "HC");
  const hcWins = hc.filter(p => p.result === "WIN").length;
  const bet = picks.filter(p => p.tier === "BET");
  const betWins = bet.filter(p => p.result === "WIN").length;

  const totalPicks = isFullDataset ? SEASON_SUMMARY.total_picks : picks.length;
  const winRate = isFullDataset
    ? SEASON_SUMMARY.overall_rate
    : (picks.length ? Math.round(picks.filter(p => p.result === "WIN").length / picks.length * 1000) / 10 : 0);
  const wins = isFullDataset
    ? Math.round(SEASON_SUMMARY.total_picks * SEASON_SUMMARY.overall_rate / 100)
    : picks.filter(p => p.result === "WIN").length;
  const losses = totalPicks - wins;
  const roi = isFullDataset
    ? Math.round((SEASON_SUMMARY.overall_rate / 100 * (FLAT_ODDS - 1) - (1 - SEASON_SUMMARY.overall_rate / 100)) * 1000) / 10
    : (picks.length ? Math.round(picks.reduce((acc, p) => acc + (p.result === "WIN" ? FLAT_ODDS - 1 : -1), 0) / picks.length * 1000) / 10 : 0);
  const mae = isFullDataset
    ? (SEASON_SUMMARY as { mae?: number }).mae ?? 4.71
    : (picks.length ? Math.round(picks.reduce((acc, p) => acc + Math.abs(p.model - p.disposals), 0) / picks.length * 10) / 10 : 0);

  const nonArcCells = [
    { label: "Picks", value: String(totalPicks) },
    { label: "W / L", value: `${wins} / ${losses}` },
    { label: "HC", value: `${hcWins}/${hc.length} (${hc.length ? Math.round(hcWins/hc.length*100) : 0}%)`, color: "#f97316" },
    { label: "BET", value: `${betWins}/${bet.length} (${bet.length ? Math.round(betWins/bet.length*100) : 0}%)`, color: "#3b82f6" },
    { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi}%`, color: roi >= 0 ? "#22c55e" : "#ef4444" },
    { label: "MAE", value: `${mae} disp` },
  ];

  return (
    <div style={{
      display: "flex", gap: 0, flexWrap: "wrap",
      background: "#080808", border: "1px solid #111",
      borderRadius: 12, overflow: "hidden", marginBottom: 20,
    }}>
      {/* Win Rate arc cell */}
      <div style={{ flex: "1 1 100px", padding: "12px 16px", borderRight: "1px solid #111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Win Rate</div>
        <WinRateArc rate={winRate} />
      </div>
      {nonArcCells.map(({ label, value, color }, i) => (
        <div key={label} style={{
          flex: "1 1 100px", padding: "14px 16px",
          borderRight: i < nonArcCells.length - 1 ? "1px solid #111" : "none",
        }}>
          <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: color ?? "#f0f0f0" }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Sort helpers ──────────────────────────────────────────────────────────────
type SortKey = "round" | "player" | "line" | "model" | "edge" | "ev" | "tier" | "result" | "disposals";

const TIER_ORDER: Record<string, number> = { HC: 0, BET: 1, SKIP: 2 };
const RESULT_ORDER: Record<string, number> = { WIN: 0, LOSS: 1 };

function sortPicks(picks: HistoricalPick[], key: SortKey, asc: boolean): HistoricalPick[] {
  return [...picks].sort((a, b) => {
    let diff = 0;
    if (key === "player" || key === "result") {
      const ka = key === "result" ? RESULT_ORDER[a.result] : a.player;
      const kb = key === "result" ? RESULT_ORDER[b.result] : b.player;
      diff = typeof ka === "string" ? ka.localeCompare(kb as string) : (ka as number) - (kb as number);
    } else if (key === "tier") {
      diff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    } else {
      diff = (a[key] as number) - (b[key] as number);
    }
    return asc ? diff : -diff;
  });
}

// ── Column header ─────────────────────────────────────────────────────────────
function ColHeader({ label, sortKey: sk, currentSort, asc, onSort }: {
  label: string; sortKey: SortKey;
  currentSort: SortKey; asc: boolean;
  onSort: (k: SortKey) => void;
}) {
  const active = currentSort === sk;
  return (
    <div
      onClick={() => onSort(sk)}
      style={{
        fontSize: 9, color: active ? "#f97316" : "#555",
        textTransform: "uppercase", letterSpacing: "0.07em",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        padding: "9px 10px",
      }}
    >
      {label} {active ? (asc ? "↑" : "↓") : ""}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AccuracyPage() {
  const [roundFilter, setRoundFilter] = useState<number | "ALL">("ALL");
  const [posFilter, setPosFilter] = useState<"ALL" | "MID" | "DEF" | "FWD" | "RUCK">("ALL");
  const [tierFilter, setTierFilter] = useState<"ALL" | "HC" | "BET" | "SKIP">("ALL");
  const [resultFilter, setResultFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("round");
  const [sortAsc, setSortAsc] = useState(true);
  const [drawerPick, setDrawerPick] = useState<HistoricalPick | null>(null);

  const filtered = useMemo(() => {
    let picks = ALL_PICKS;
    if (roundFilter !== "ALL") picks = picks.filter(p => p.round === roundFilter);
    if (posFilter !== "ALL") picks = picks.filter(p => p.position === posFilter);
    if (tierFilter !== "ALL") picks = picks.filter(p => p.tier === tierFilter);
    if (resultFilter !== "ALL") picks = picks.filter(p => p.result === resultFilter);
    return sortPicks(picks, sortKey, sortAsc);
  }, [roundFilter, posFilter, tierFilter, resultFilter, sortKey, sortAsc]);

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortAsc(a => !a);
    else { setSortKey(k); setSortAsc(true); }
  }

  const TIER_COLORS: Record<string, string> = { HC: "#f97316", BET: "#3b82f6", SKIP: "#555" };

  const GRID = "40px 1.4fr 55px 55px 55px 55px 55px 55px 55px 55px 65px 65px 60px 60px";

  const sortProps = { currentSort: sortKey, asc: sortAsc, onSort: handleSort };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Verified Results
          </div>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Track Record
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            Showing notable picks — {SEASON_SUMMARY.total_picks} total predictions this season · Click any row for full breakdown.
          </p>
        </div>

        {/* Season headline stats (from results.json authoritative data) */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1,
          background: "#111", borderRadius: 12, overflow: "hidden", marginBottom: 20,
        }}>
          {[
            { label: "Overall", value: `${SEASON_SUMMARY.overall_rate}%`, sub: `${SEASON_SUMMARY.total_picks} picks`, color: "#f0f0f0" },
            { label: "Filtered (E/V ≥ 0.50)", value: `${SEASON_SUMMARY.filtered_rate}%`, sub: `${SEASON_SUMMARY.filtered_wins}W / ${SEASON_SUMMARY.filtered_picks - SEASON_SUMMARY.filtered_wins}L`, color: "#f97316" },
            { label: "HC (STRONG)", value: `${SEASON_SUMMARY.strong_rate}%`, sub: `${SEASON_SUMMARY.strong_wins}W / ${SEASON_SUMMARY.strong_picks - SEASON_SUMMARY.strong_wins}L`, color: "#22c55e" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: "#080808", padding: "20px 24px" }}>
              <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color }}>{value}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ROI Chart */}
        <ROIChart picks={ALL_PICKS} />

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
          {/* Round */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", ...ROUNDS] as (number | "ALL")[]).map(r => (
              <button key={r} onClick={() => setRoundFilter(r)} style={{
                padding: "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: roundFilter === r ? "1px solid #f97316" : "1px solid #111",
                background: roundFilter === r ? "#f97316" : "#080808",
                color: roundFilter === r ? "#000" : "#555",
              }}>{r === "ALL" ? "All Rds" : `R${r}`}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "#111" }} />
          {/* Position */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "MID", "DEF", "FWD", "RUCK"] as const).map(p => (
              <button key={p} onClick={() => setPosFilter(p)} style={{
                padding: "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: posFilter === p ? "1px solid #f97316" : "1px solid #111",
                background: posFilter === p ? "#f97316" : "#080808",
                color: posFilter === p ? "#000" : "#555",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "#111" }} />
          {/* Tier */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "HC", "BET", "SKIP"] as const).map(t => (
              <button key={t} onClick={() => setTierFilter(t)} style={{
                padding: "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: tierFilter === t ? `1px solid ${TIER_COLORS[t] ?? "#f97316"}` : "1px solid #111",
                background: tierFilter === t ? (TIER_COLORS[t] ?? "#f97316") : "#080808",
                color: tierFilter === t ? "#000" : "#555",
              }}>{t}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "#111" }} />
          {/* Result */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "WIN", "LOSS"] as const).map(r => (
              <button key={r} onClick={() => setResultFilter(r)} style={{
                padding: "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: resultFilter === r ? "1px solid #f97316" : "1px solid #111",
                background: resultFilter === r ? "#f97316" : "#080808",
                color: resultFilter === r ? "#000" : "#555",
              }}>{r}</button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#555" }}>{filtered.length} picks</span>
        </div>

        {/* Stats bar (live updates with filters) */}
        <StatsBar picks={filtered} isFullDataset={roundFilter === "ALL" && posFilter === "ALL" && tierFilter === "ALL" && resultFilter === "ALL"} />

        {/* Table */}
        <div className="track-table-wrap" style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: GRID, borderBottom: "1px solid #111", background: "#050505" }}>
            <div style={{ padding: "9px 10px" }} />
            <ColHeader label="Player" sortKey="player" {...sortProps} />
            <ColHeader label="Rd" sortKey="round" {...sortProps} />
            <div style={{ padding: "9px 10px", fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>Pos</div>
            <div style={{ padding: "9px 10px", fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>vs</div>
            <ColHeader label="Line" sortKey="line" {...sortProps} />
            <ColHeader label="Model" sortKey="model" {...sortProps} />
            <ColHeader label="Edge" sortKey="edge" {...sortProps} />
            <ColHeader label="E/V" sortKey="ev" {...sortProps} />
            <ColHeader label="Tier" sortKey="tier" {...sortProps} />
            <ColHeader label="Dir" sortKey="result" {...sortProps} />
            <ColHeader label="Actual" sortKey="disposals" {...sortProps} />
            <ColHeader label="Result" sortKey="result" {...sortProps} />
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>No picks match these filters.</div>
              <button
                onClick={() => { setRoundFilter("ALL"); setPosFilter("ALL"); setTierFilter("ALL"); setResultFilter("ALL"); }}
                style={{ background: "#f97316", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#000" }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Rows */}
          {filtered.map((p, i) => (
            <div
              key={`${p.player}-${p.round}`}
              onClick={() => setDrawerPick(p)}
              style={{
                display: "grid", gridTemplateColumns: GRID,
                borderBottom: "1px solid #0a0a0a", alignItems: "center",
                background: p.result === "WIN" ? "rgba(34,197,94,0.02)" : "transparent",
                cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = p.result === "WIN" ? "rgba(34,197,94,0.02)" : "transparent")}
            >
              <div style={{ padding: "8px 10px", display: "flex", justifyContent: "center" }}>
                <PlayerAvatar name={p.player} team={p.team} size={26} imageUrl={p.imageUrl || undefined} />
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e0e0e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.player}</div>
                <div style={{ fontSize: 9, color: "#666", marginTop: 1 }}>{p.team}</div>
              </div>
              <div style={{ padding: "8px 10px", fontSize: 11, color: "#555" }}>R{p.round}</div>
              <div style={{ padding: "8px 10px" }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, color: "#f97316",
                  background: "#1a0f00", borderRadius: 3, padding: "1px 4px",
                }}>{p.position}</span>
              </div>
              <div style={{ padding: "8px 10px", fontSize: 11, color: "#666" }}>{p.opponent}</div>
              <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#888" }}>{p.line}</div>
              <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#f97316" }}>{p.model}</div>
              <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, color: p.edge >= 0 ? "#22c55e" : "#ef4444" }}>
                {p.edge >= 0 ? "+" : ""}{p.edge}
              </div>
              <div style={{ padding: "8px 10px", fontSize: 11, color: "#888" }}>{p.ev.toFixed(2)}</div>
              <div style={{ padding: "8px 10px" }}>
                <span className={p.tier === "HC" ? "badge-hc" : undefined} style={{
                  fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                  background: p.tier === "HC" ? "#f97316" : p.tier === "BET" ? "#3b82f6" : "#222",
                  color: p.tier === "SKIP" ? "#555" : "#000",
                }}>{p.tier}</span>
              </div>
              <div style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: p.direction === "OVER" ? "#22c55e" : "#ef4444" }}>
                {p.direction} {p.direction === "OVER" ? "⬆" : "⬇"}
              </div>
              <div style={{ padding: "8px 10px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.disposals}</div>
              <div style={{ padding: "8px 10px", fontSize: 11, fontWeight: 800, color: p.result === "WIN" ? "#22c55e" : "#ef4444" }}>
                {p.result === "WIN" ? "✓" : "✗"} {p.result}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 24, padding: "14px 18px", background: "#080808", border: "1px solid #111", borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: "#555", lineHeight: 1.8 }}>
            <strong style={{ color: "#666" }}>Disclaimer:</strong> SportSphere provides analytical data only. Nothing here is financial or betting advice. Past model performance does not guarantee future results. You must be 18+ to bet. National Gambling Helpline: <strong style={{ color: "#666" }}>1800 858 858</strong> · <a href="https://www.gamblinghelponline.org.au" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>gamblinghelponline.org.au</a>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerPick && <PickDrawer pick={drawerPick} onClose={() => setDrawerPick(null)} />}

      <Footer />
    </div>
  );
}
