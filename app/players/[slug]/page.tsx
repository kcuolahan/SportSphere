"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PLAYERS, getPlayerById } from "@/data/players";
import { getTeamName } from "@/lib/teams";
import { getCurrentPredictions } from "@/lib/data";

const predictions = getCurrentPredictions();
const SORTED_BY_EV = [...PLAYERS].sort((a, b) => b.stats.ev - a.stats.ev);

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ values, color = "#f97316" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 120, H = 32, PAD = 4;
  const cw = W - PAD * 2, ch = H - PAD * 2;
  const pts = values.map((v, i) => [
    PAD + (i / (values.length - 1)) * cw,
    PAD + (1 - (v - min) / range) * ch,
  ]);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={color} />
    </svg>
  );
}

// ── Bar chart for disposals by round ──────────────────────────────────────────
function DisposalsChart({ player }: { player: ReturnType<typeof getPlayerById> }) {
  if (!player) return null;
  const rounds = player.historicalRounds;
  const maxD = Math.max(...rounds.map(r => r.disposals), player.stats.line + 5);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
      {rounds.map(r => {
        const pct = (r.disposals / maxD) * 100;
        const overLine = r.disposals > r.line;
        return (
          <div key={r.round} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: "#555" }}>{r.disposals}</div>
            <div style={{
              width: "100%", height: `${pct}%`,
              background: overLine ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.5)",
              borderRadius: "3px 3px 0 0",
              position: "relative",
            }}>
              {/* Line marker */}
              <div style={{
                position: "absolute",
                bottom: `${(r.line / r.disposals) * 100}%`,
                left: 0, right: 0, height: 1,
                background: "#f97316",
              }} />
            </div>
            <div style={{ fontSize: 9, color: "#444" }}>R{r.round}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Radar chart (SVG) ─────────────────────────────────────────────────────────
function RadarChart({ player }: { player: ReturnType<typeof getPlayerById> }) {
  if (!player) return null;
  const CX = 100, CY = 100, R = 75;
  const labels = ["TOG%", "CBA", "Edge", "E/V", "2026 Avg", "Std Dev"];
  const maxVals = [1.0, 1.0, 10, 2.0, 40, 12];
  const playerVals = [
    player.togPct,
    player.cbaRate,
    Math.min(Math.abs(player.stats.edge), 10),
    Math.min(player.stats.ev, 2.0),
    Math.min(player.seasonAvg2026, 40),
    Math.min(player.stdDev, 12),
  ];
  const n = labels.length;

  function point(idx: number, val: number, max: number, radius: number) {
    const angle = (idx / n) * Math.PI * 2 - Math.PI / 2;
    const r = (val / max) * radius;
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
  }

  const playerPts = playerVals.map((v, i) => point(i, v, maxVals[i], R));
  const playerPath = playerPts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + "Z";
  const gridPts = (f: number) => Array.from({ length: n }, (_, i) => point(i, f, 1, R));

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 200, height: "auto" }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1.0].map(f => {
        const pts = gridPts(f);
        const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + "Z";
        return <path key={f} d={d} fill="none" stroke="#1a1a1a" strokeWidth={1} />;
      })}
      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = point(i, 1, 1, R);
        return <line key={i} x1={CX} y1={CY} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="#1a1a1a" strokeWidth={1} />;
      })}
      {/* Player area */}
      <path d={playerPath} fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth={2} />
      {/* Label */}
      {labels.map((label, i) => {
        const [x, y] = point(i, 1.2, 1, R);
        return (
          <text key={label} x={x.toFixed(1)} y={y.toFixed(1)} fontSize={7} fill="#555" textAnchor="middle" dominantBaseline="middle">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ player }: { player: NonNullable<ReturnType<typeof getPlayerById>> }) {
  const recentDisposals = player.historicalRounds.map(r => r.disposals).slice(-5);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Season avgs */}
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Season Averages</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>2026 Avg</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#f0f0f0" }}>{player.seasonAvg2026}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>2025 Avg</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#555" }}>{player.seasonAvg2025}</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#444", marginBottom: 6 }}>Last {recentDisposals.length} rounds</div>
        <Sparkline values={recentDisposals} />
      </div>

      {/* Profile */}
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Player Profile</div>
        {[
          { label: "TOG%", value: `${Math.round(player.togPct * 100)}%` },
          { label: "CBA Rate", value: `${Math.round(player.cbaRate * 100)}%` },
          { label: "Std Dev", value: `±${player.stdDev}` },
          { label: "Play Style", value: player.playStyle },
          { label: "Venue", value: player.venue },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #0a0a0a" }}>
            <span style={{ fontSize: 11, color: "#555" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: label === "Play Style" ? "capitalize" : "none" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Last 5 rounds table */}
      <div style={{ gridColumn: "1 / -1", background: "#080808", border: "1px solid #111", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #111" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Round History</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "60px 90px 90px 90px", padding: "8px 16px", borderBottom: "1px solid #0a0a0a" }}>
          {["Round", "Disposals", "Line", "Result"].map(h => (
            <span key={h} style={{ fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>
        {player.historicalRounds.map(r => (
          <div key={r.round} style={{ display: "grid", gridTemplateColumns: "60px 90px 90px 90px", padding: "10px 16px", borderBottom: "1px solid #0a0a0a", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f0f0f0" }}>R{r.round}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: r.disposals > r.line ? "#22c55e" : "#ef4444" }}>{r.disposals}</span>
            <span style={{ fontSize: 12, color: "#555" }}>{r.line}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.result === "WIN" ? "#22c55e" : "#ef4444" }}>
              {r.result === "WIN" ? "✓ WIN" : "✗ LOSS"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: History ──────────────────────────────────────────────────────────────
function HistoryTab({ player }: { player: NonNullable<ReturnType<typeof getPlayerById>> }) {
  const wins = player.historicalRounds.filter(r => r.result === "WIN").length;
  const losses = player.historicalRounds.length - wins;
  let streak = 0;
  let streakType = "";
  for (let i = player.historicalRounds.length - 1; i >= 0; i--) {
    if (i === player.historicalRounds.length - 1) {
      streakType = player.historicalRounds[i].result;
      streak = 1;
    } else if (player.historicalRounds[i].result === streakType) {
      streak++;
    } else break;
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 6 }}>Record</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f0f0f0" }}>{wins}W / {losses}L</div>
          <div style={{ fontSize: 11, color: "#555" }}>{player.historicalRounds.length > 0 ? Math.round(wins / player.historicalRounds.length * 100) : 0}% win rate</div>
        </div>
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 6 }}>Current Streak</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: streakType === "WIN" ? "#22c55e" : "#ef4444" }}>
            {streak} {streakType}
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>last {streak} picks</div>
        </div>
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 6 }}>Avg vs Line</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f97316" }}>
            {Math.round(player.historicalRounds.reduce((a, r) => a + (r.disposals - r.line), 0) / player.historicalRounds.length * 10) / 10}
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>disposals above line avg</div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Disposals by Round</div>
        <DisposalsChart player={player} />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(34,197,94,0.6)" }} />
            <span style={{ fontSize: 9, color: "#444" }}>Over line</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(239,68,68,0.5)" }} />
            <span style={{ fontSize: 9, color: "#444" }}>Under line</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 1.5, background: "#f97316" }} />
            <span style={{ fontSize: 9, color: "#444" }}>Line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Model Breakdown ──────────────────────────────────────────────────────
function ModelTab({ player }: { player: NonNullable<ReturnType<typeof getPlayerById>> }) {
  const factors = [
    { label: "Season Blend", desc: "35% 2025 + 65% 2026 average", value: `${player.seasonAvg2025} → ${player.seasonAvg2026}`, pct: 35 },
    { label: "TOG-Adjusted Rate", desc: "Scales prediction by time on ground", value: `${Math.round(player.togPct * 100)}% TOG`, pct: 40 },
    { label: "Opponent Factor", desc: "Concession rate vs league avg", value: "1.00× (current matchup)", pct: 25 },
    { label: "Play Style Multiplier", desc: `${player.playStyle} style × conditions`, value: player.playStyle, pct: 60 },
    { label: "Rules Boost", desc: "Position-based CBA rule adjustment", value: player.position === "MID" ? "+2%" : player.position === "DEF" ? "+3%" : "—", pct: 20 },
    { label: "CBA Dampening", desc: "Centre bounce attendance adjustment", value: `${Math.round(player.cbaRate * 100)}% CBA rate`, pct: 10 },
  ];

  return (
    <div>
      {/* Prediction summary */}
      <div style={{
        background: "#0a0800", border: "1px solid #f9731620",
        borderRadius: 10, padding: "16px 18px", marginBottom: 20,
        display: "flex", gap: 24, alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Model Prediction</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#f0f0f0" }}>{player.stats.model}</div>
          <div style={{ fontSize: 11, color: "#555" }}>disposals predicted</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#555" }}>Edge vs line ({player.stats.line})</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: player.stats.edge >= 0 ? "#22c55e" : "#ef4444" }}>
              {player.stats.edge >= 0 ? "+" : ""}{player.stats.edge}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#555" }}>Edge / Vol ratio</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>{player.stats.ev.toFixed(3)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#555" }}>Confidence tier</span>
            <span className={player.stats.tier === "HC" ? "badge-hc" : undefined} style={{
              fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
              background: player.stats.tier === "HC" ? "#f97316" : player.stats.tier === "BET" ? "#3b82f6" : "#333",
              color: player.stats.tier === "SKIP" ? "#555" : "#000",
            }}>{player.stats.tier}</span>
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #111" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Factor Weights</span>
        </div>
        {factors.map(f => (
          <div key={f.label} style={{ padding: "12px 16px", borderBottom: "1px solid #0a0a0a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e0e0e0" }}>{f.label}</span>
                <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>{f.desc}</div>
              </div>
              <span style={{ fontSize: 12, color: "#888", textAlign: "right" }}>{f.value}</span>
            </div>
            <div style={{ height: 3, background: "#111", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${f.pct}%`, height: "100%", background: "#f97316", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Radar chart */}
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18, display: "flex", gap: 20, alignItems: "center" }}>
        <RadarChart player={player} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Factor Profile</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.8 }}>
            {player.playStyle === "run-and-gun"
              ? "High-volume, transition-style player. Benefits from fast-moving games and dry conditions."
              : player.playStyle === "inside"
              ? "Inside midfielder. Accumulates through contested ball. More consistent across conditions."
              : player.playStyle === "contested"
              ? "Contested beast. Reliable volume player whose output is less weather-dependent."
              : "Outside accumulator. Production can vary with game flow and defensive pressure."}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "#f97316" }}>
            Std Dev: ±{player.stdDev} · Confidence interval: {player.stats.model - player.stdDev * 1.5}–{player.stats.model + player.stdDev * 1.5}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: DvP ─────────────────────────────────────────────────────────────────
function DvPTab({ player }: { player: NonNullable<ReturnType<typeof getPlayerById>> }) {
  const pick = predictions.picks.find(p => p.player === player.fullName);

  return (
    <div>
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Opponent: {player.opponent} vs {player.position}s
        </div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>
          The DvP data for {player.opponent} is based on the season-to-date concession rate for {player.position}s.
          See the <Link href="/defence" style={{ color: "#f97316", textDecoration: "none" }}>DvP Rankings</Link> page for full team-by-team breakdown.
        </div>
      </div>

      {pick && (
        <div style={{
          background: pick.filter_pass ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
          border: `1px solid ${pick.filter_pass ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: 10, padding: 18,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: pick.filter_pass ? "#22c55e" : "#ef4444", marginBottom: 8 }}>
            {pick.filter_pass ? "✓ This pick passes the E/V filter" : "✗ This pick does not meet E/V threshold"}
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            Line {pick.bookie_line} · {pick.direction} · E/V {pick.edge_vol.toFixed(3)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Tab = "overview" | "history" | "model" | "dvp";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const player = getPlayerById(slug);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!player) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "160px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Player not found</h1>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>"{slug}" doesn't match any player in our database.</p>
          <Link href="/players" style={{ background: "#f97316", color: "#000", textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            ← Back to Players
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Prev/Next by E/V ranking
  const idx = SORTED_BY_EV.findIndex(p => p.id === player.id);
  const prev = idx > 0 ? SORTED_BY_EV[idx - 1] : null;
  const next = idx < SORTED_BY_EV.length - 1 ? SORTED_BY_EV[idx + 1] : null;

  const pick = predictions.picks.find(p => p.player === player.fullName);
  const tierColor = player.stats.tier === "HC" ? "#f97316" : player.stats.tier === "BET" ? "#3b82f6" : "#555";

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "history", label: "History" },
    { key: "model", label: "Model Breakdown" },
    { key: "dvp", label: "DvP" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 11, color: "#333" }}>
          <Link href="/predictions" style={{ color: "#555", textDecoration: "none" }}>Picks</Link>
          <span>›</span>
          <Link href="/players" style={{ color: "#555", textDecoration: "none" }}>Players</Link>
          <span>›</span>
          <span style={{ color: "#f0f0f0" }}>{player.fullName}</span>
        </div>

        {/* Hero section */}
        <div style={{
          background: "#080808", border: "1px solid #1a1a1a",
          borderRadius: 14, padding: "24px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar */}
            <PlayerAvatar name={player.fullName} team={player.team} size={96} imageUrl={player.imageUrl || undefined} />

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
                  {player.fullName}
                </h1>
                <span className={player.stats.tier === "HC" ? "badge-hc" : undefined} style={{
                  fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 5,
                  background: tierColor, color: player.stats.tier === "SKIP" ? "#555" : "#000",
                }}>{player.stats.tier}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: "#555" }}>{getTeamName(player.team)}</span>
                <span style={{ color: "#222" }}>·</span>
                <span style={{ fontSize: 12, color: "#555" }}>{player.position}</span>
                <span style={{ color: "#222" }}>·</span>
                <span style={{ fontSize: 12, color: "#555" }}>vs {player.opponent}</span>
                <span style={{ color: "#222" }}>·</span>
                <span style={{ fontSize: 12, color: "#555" }}>{player.venue}</span>
              </div>

              {/* Current round stats */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Line", value: player.stats.line },
                  { label: "Model", value: player.stats.model, color: "#f97316" },
                  { label: "Edge", value: `${player.stats.edge >= 0 ? "+" : ""}${player.stats.edge}`, color: player.stats.edge >= 0 ? "#22c55e" : "#ef4444" },
                  { label: "E/V", value: player.stats.ev.toFixed(3), color: "#60a5fa" },
                  { label: "Dir", value: player.stats.direction, color: player.stats.direction === "OVER" ? "#22c55e" : "#ef4444" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: color ?? "#f0f0f0" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid #111", paddingBottom: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: "none", border: "none",
                borderBottom: activeTab === t.key ? "2px solid #f97316" : "2px solid transparent",
                padding: "10px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                color: activeTab === t.key ? "#f97316" : "#555",
                transition: "color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && <OverviewTab player={player} />}
        {activeTab === "history" && <HistoryTab player={player} />}
        {activeTab === "model" && <ModelTab player={player} />}
        {activeTab === "dvp" && <DvPTab player={player} />}

        {/* Prev / Next navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #111" }}>
          {prev ? (
            <Link href={`/players/${prev.id}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PlayerAvatar name={prev.fullName} team={prev.team} size={32} />
                <div>
                  <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em" }}>← Higher E/V</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{prev.fullName}</div>
                </div>
              </div>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/players/${next.id}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em" }}>Lower E/V →</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{next.fullName}</div>
                </div>
                <PlayerAvatar name={next.fullName} team={next.team} size={32} />
              </div>
            </Link>
          ) : <div />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
