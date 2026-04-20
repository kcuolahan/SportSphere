"use client";

import { useState, useMemo } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import resultsData from "@/data/results.json";
import { totalPicks, roundsLabel, currentSeason } from "@/lib/siteData";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface Pick {
  player: string;
  position: string;
  team: string;
  opponent?: string;
  line?: number;
  bookie_line?: number;
  predicted: number;
  actual: number;
  signal?: string;
  direction?: string;
  confidence: string;
  edge_vol: number;
  result: "WIN" | "LOSS";
  round: number;
}

/* ── Build picks exclusively from results.json ─────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL_PICKS: Pick[] = resultsData.rounds.flatMap((r: any) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  r.picks.map((p: any) => ({ ...p, round: r.round }))
);

const SS = resultsData.season_summary;
const ROUNDS = [3, 4, 5, 6] as const;
const FLAT_ODDS = 1.90;

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function getLine(p: Pick): number { return p.bookie_line ?? p.line ?? 0; }
function getDir(p: Pick): string { return p.direction ?? p.signal ?? "OVER"; }
function getEdge(p: Pick): number {
  return Math.round((p.predicted - getLine(p)) * 10) / 10;
}
function getTier(ev: number): "HC" | "BET" | "SKIP" {
  return ev >= 0.90 ? "HC" : ev >= 0.50 ? "BET" : "SKIP";
}
function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ── Avatar ─────────────────────────────────────────────────────────────────── */
function Avatar({ name, team }: { name: string; team: string }) {
  const TEAM_COLORS: Record<string, string> = {
    ADE: "#002b5c", BRL: "#a8002a", CAR: "#0d1560", COL: "#1a1a1a",
    ESS: "#cc2200", FRE: "#44003b", GEE: "#003087", GCS: "#cc0000",
    GWS: "#ee6600", HAW: "#5a2a00", MEL: "#cc0000", NTH: "#003366",
    PTA: "#004f9f", RIC: "#ffd200", STK: "#cc0000", SYD: "#cc0000",
    WBD: "#014196", WCE: "#003087",
  };
  const bg = TEAM_COLORS[team] ?? "#222";
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 9, fontWeight: 800,
      color: "#fff", flexShrink: 0, letterSpacing: "0.02em",
    }}>
      {initials(name)}
    </div>
  );
}

/* ── Tier badge ─────────────────────────────────────────────────────────────── */
function TierBadge({ tier }: { tier: "HC" | "BET" | "SKIP" }) {
  const colors = { HC: { bg: "#f97316", color: "#000" }, BET: { bg: "#22c55e", color: "#000" }, SKIP: { bg: "#222", color: "#555" } };
  const c = colors[tier];
  return (
    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: c.bg, color: c.color }}>
      {tier}
    </span>
  );
}

/* ── Donut win-rate arc ─────────────────────────────────────────────────────── */
function WinArc({ rate }: { rate: number }) {
  const R = 20, C = 2 * Math.PI * R;
  const color = rate >= 60 ? "#22c55e" : rate >= 52 ? "#f97316" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
      <svg width={50} height={50} viewBox="0 0 50 50" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={25} cy={25} r={R} fill="none" stroke="#1a1a1a" strokeWidth={4} />
        <circle cx={25} cy={25} r={R} fill="none" stroke={color} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (rate / 100) * C}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color, lineHeight: 1 }}>{rate}%</span>
      </div>
    </div>
  );
}

/* ── P&L chart ──────────────────────────────────────────────────────────────── */
function PLChart({ picks }: { picks: Pick[] }) {
  const bet = picks.filter(p => p.edge_vol >= 0.50 && p.position !== "FWD");
  const hc = bet.filter(p => getTier(p.edge_vol) === "HC");

  const betSeries = [0];
  const hcSeries: number[] = [];
  let hcCursor = 0;

  bet.forEach(p => {
    const gain = p.result === "WIN" ? FLAT_ODDS - 1 : -1;
    betSeries.push(betSeries[betSeries.length - 1] + gain);
  });
  // build HC cumulative alongside full series
  const hcSeriesFull = [0];
  bet.forEach(p => {
    const isHC = getTier(p.edge_vol) === "HC";
    if (isHC) hcCursor += p.result === "WIN" ? FLAT_ODDS - 1 : -1;
    hcSeriesFull.push(hcCursor);
  });
  void hcSeries; void hc;

  const W = 800, H = 160, PL = 44, PR = 16, PT = 12, PB = 24;
  const cw = W - PL - PR, ch = H - PT - PB;
  const n = betSeries.length;
  if (n < 2) return null;

  const allVals = [...betSeries, ...hcSeriesFull];
  const minY = Math.min(...allVals, -1);
  const maxY = Math.max(...allVals, 1);
  const range = maxY - minY || 1;

  const fx = (i: number) => PL + (i / (n - 1)) * cw;
  const fy = (v: number) => PT + (1 - (v - minY) / range) * ch;

  const betPath = betSeries.map((v, i) => `${i === 0 ? "M" : "L"}${fx(i).toFixed(1)},${fy(v).toFixed(1)}`).join(" ");
  const hcPath = hcSeriesFull.map((v, i) => `${i === 0 ? "M" : "L"}${fx(i).toFixed(1)},${fy(v).toFixed(1)}`).join(" ");
  const zero = fy(0);

  // Round tick marks
  const roundTicks = ROUNDS.map(r => {
    const idx = bet.findIndex((p, i) => i > 0 && bet[i - 1].round < r && p.round >= r);
    return { r, x: idx >= 0 ? fx(idx) : null };
  });

  const finalBet = betSeries[betSeries.length - 1];
  const finalHC = hcSeriesFull[hcSeriesFull.length - 1];

  return (
    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Cumulative P&L — E/V ≥ 0.50 (flat $1 @ {FLAT_ODDS} odds)
        </span>
        <div style={{ display: "flex", gap: 14 }}>
          {[{ color: "#f97316", label: `HC only (${finalHC >= 0 ? "+" : ""}${finalHC.toFixed(1)})` }, { color: "#888", label: `All filtered (${finalBet >= 0 ? "+" : ""}${finalBet.toFixed(1)})` }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 2, background: l.color, borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "#666" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {[minY, 0, maxY].map(v => (
          <g key={v}>
            <line x1={PL} y1={fy(v)} x2={W - PR} y2={fy(v)} stroke="#111" strokeWidth={v === 0 ? 1.5 : 0.5} strokeDasharray={v === 0 ? "0" : "3,3"} />
            <text x={PL - 4} y={fy(v) + 4} fontSize={8} fill="#555" textAnchor="end">{v >= 0 ? "+" : ""}{v.toFixed(1)}</text>
          </g>
        ))}
        {roundTicks.map(({ r, x }) => x !== null && (
          <g key={r}>
            <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#111" strokeWidth={0.5} strokeDasharray="2,4" />
            <text x={x} y={H - 4} fontSize={8} fill="#555" textAnchor="middle">R{r}</text>
          </g>
        ))}
        <path d={betPath} fill="none" stroke="#888" strokeWidth={1.5} />
        <path d={hcPath} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" />
        <text x={W - PR + 3} y={zero + 4} fontSize={8} fill="#666">0</text>
        <circle cx={fx(n - 1)} cy={fy(betSeries[n - 1])} r={3} fill="#888" />
        <circle cx={fx(hcSeriesFull.length - 1)} cy={fy(hcSeriesFull[hcSeriesFull.length - 1])} r={3} fill="#f97316" />
      </svg>
    </div>
  );
}

/* ── Stats bar ──────────────────────────────────────────────────────────────── */
function StatsBar({ picks }: { picks: Pick[] }) {
  const wins = picks.filter(p => p.result === "WIN").length;
  const losses = picks.length - wins;
  const wr = picks.length ? Math.round(wins / picks.length * 1000) / 10 : 0;
  const hcPicks = picks.filter(p => getTier(p.edge_vol) === "HC");
  const hcWins = hcPicks.filter(p => p.result === "WIN").length;
  const betPicks = picks.filter(p => getTier(p.edge_vol) === "BET");
  const betWins = betPicks.filter(p => p.result === "WIN").length;
  const roi = picks.length
    ? Math.round(picks.reduce((a, p) => a + (p.result === "WIN" ? FLAT_ODDS - 1 : -1), 0) / picks.length * 1000) / 10
    : 0;
  const mae = picks.length
    ? Math.round(picks.reduce((a, p) => a + Math.abs(p.predicted - p.actual), 0) / picks.length * 10) / 10
    : 0;

  const cells = [
    { label: "Picks", value: String(picks.length), color: "#f0f0f0" },
    { label: "W / L", value: `${wins} / ${losses}`, color: "#f0f0f0" },
    { label: "HC", value: `${hcWins}/${hcPicks.length}${hcPicks.length ? ` (${Math.round(hcWins / hcPicks.length * 100)}%)` : ""}`, color: "#f97316" },
    { label: "BET", value: `${betWins}/${betPicks.length}${betPicks.length ? ` (${Math.round(betWins / betPicks.length * 100)}%)` : ""}`, color: "#22c55e" },
    { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi}%`, color: roi >= 0 ? "#22c55e" : "#ef4444" },
    { label: "MAE", value: `${mae} disp`, color: "#f0f0f0" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ flex: "0 0 auto", padding: "12px 16px", borderRight: "1px solid #111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Win Rate</div>
        <WinArc rate={wr} />
      </div>
      {cells.map(({ label, value, color }, i) => (
        <div key={label} style={{ flex: "1 1 80px", padding: "14px 16px", borderRight: i < cells.length - 1 ? "1px solid #111" : "none" }}>
          <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Season summary header cards ────────────────────────────────────────────── */
function SeasonSummary() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 1, background: "#111", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      {/* HC — largest */}
      <div style={{ background: "#080808", padding: "24px 28px" }}>
        <div style={{ fontSize: 10, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
          HC — HIGH CONVICTION (E/V ≥ 0.90)
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", color: "#f97316", lineHeight: 1 }}>
          {SS.strong_rate}%
        </div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
          {SS.strong_wins}W / {SS.strong_picks - SS.strong_wins}L · {SS.strong_picks} picks
        </div>
      </div>
      {/* Filtered */}
      <div style={{ background: "#080808", padding: "24px" }}>
        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Filtered (E/V ≥ 0.50)</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#22c55e" }}>{SS.filtered_rate}%</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
          {SS.filtered_wins}W / {SS.filtered_picks - SS.filtered_wins}L · {SS.filtered_picks} picks
        </div>
      </div>
      {/* Overall */}
      <div style={{ background: "#080808", padding: "24px" }}>
        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Overall (all picks)</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0f0f0" }}>{SS.overall_rate}%</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>{SS.total_picks} total picks · {roundsLabel}</div>
      </div>
    </div>
  );
}

/* ── Filter pill button ─────────────────────────────────────────────────────── */
function Pill({ label, active, onClick, activeColor }: { label: string; active: boolean; onClick: () => void; activeColor?: string }) {
  const ac = activeColor ?? "#f97316";
  return (
    <button onClick={onClick} style={{
      padding: "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
      cursor: "pointer", border: active ? `1px solid ${ac}` : "1px solid #111",
      background: active ? ac : "#080808", color: active ? "#000" : "#555",
    }}>{label}</button>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function AccuracyPage() {
  const [roundFilter, setRoundFilter] = useState<number | "ALL">("ALL");
  const [posFilter, setPosFilter] = useState<"ALL" | "MID" | "DEF" | "FWD" | "RUCK">("ALL");
  const [tierFilter, setTierFilter] = useState<"ALL" | "HC" | "BET" | "SKIP">("ALL");
  const [resultFilter, setResultFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [openPick, setOpenPick] = useState<Pick | null>(null);
  const [sortKey, setSortKey] = useState<keyof Pick>("round");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let picks = ALL_PICKS;
    if (roundFilter !== "ALL") picks = picks.filter(p => p.round === roundFilter);
    if (posFilter !== "ALL") picks = picks.filter(p => p.position === posFilter);
    if (tierFilter !== "ALL") picks = picks.filter(p => getTier(p.edge_vol) === tierFilter);
    if (resultFilter !== "ALL") picks = picks.filter(p => p.result === resultFilter);
    return [...picks].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const diff = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortAsc ? diff : -diff;
    });
  }, [roundFilter, posFilter, tierFilter, resultFilter, sortKey, sortAsc]);

  function toggleSort(key: keyof Pick) {
    if (key === sortKey) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  const TIER_COLORS: Record<string, string> = { HC: "#f97316", BET: "#22c55e", SKIP: "#555" };
  const GRID = "36px 1.4fr 40px 50px 60px 52px 52px 52px 52px 52px 50px 54px 62px";

  function SortHeader({ label, sortField }: { label: string; sortField: keyof Pick }) {
    const active = sortKey === sortField;
    return (
      <div onClick={() => toggleSort(sortField)} style={{
        fontSize: 9, color: active ? "#f97316" : "#555",
        textTransform: "uppercase", letterSpacing: "0.07em",
        cursor: "pointer", userSelect: "none", padding: "9px 8px", whiteSpace: "nowrap",
      }}>
        {label}{active ? (sortAsc ? " ↑" : " ↓") : ""}
      </div>
    );
  }

  const POS_COLORS: Record<string, string> = { MID: "#f97316", DEF: "#3b82f6", FWD: "#22c55e", RUCK: "#a855f7" };

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
          <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.7 }}>
            {totalPicks} picks · {roundsLabel} · {currentSeason} season · verified vs Wheeloratings
          </p>
        </div>

        {/* Season summary */}
        <SeasonSummary />

        {/* P&L chart */}
        <PLChart picks={ALL_PICKS} />

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            <Pill label="All Rds" active={roundFilter === "ALL"} onClick={() => setRoundFilter("ALL")} />
            {ROUNDS.map(r => <Pill key={r} label={`R${r}`} active={roundFilter === r} onClick={() => setRoundFilter(r)} />)}
          </div>
          <div style={{ width: 1, height: 20, background: "#111" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "MID", "DEF", "FWD", "RUCK"] as const).map(p => (
              <Pill key={p} label={p} active={posFilter === p} onClick={() => setPosFilter(p)} />
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "#111" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "HC", "BET", "SKIP"] as const).map(t => (
              <Pill key={t} label={t} active={tierFilter === t} onClick={() => setTierFilter(t)} activeColor={TIER_COLORS[t]} />
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "#111" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "WIN", "LOSS"] as const).map(r => (
              <Pill key={r} label={r} active={resultFilter === r} onClick={() => setResultFilter(r)} activeColor={r === "WIN" ? "#22c55e" : r === "LOSS" ? "#ef4444" : undefined} />
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#555" }}>{filtered.length} picks</span>
        </div>

        {/* Stats bar */}
        <StatsBar picks={filtered} />

        {/* Table */}
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
          {/* Header row */}
          <div className="track-row" style={{ display: "grid", gridTemplateColumns: GRID, borderBottom: "1px solid #111", background: "#050505" }}>
            <div style={{ padding: "9px 8px" }} />
            <SortHeader label="Player" sortField="player" />
            <SortHeader label="Rd" sortField="round" />
            <div style={{ padding: "9px 8px", fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>Pos</div>
            <SortHeader label="vs" sortField="opponent" />
            <SortHeader label="Line" sortField="line" />
            <div className="col-hide-mobile"><SortHeader label="Model" sortField="predicted" /></div>
            <div className="col-hide-mobile"><SortHeader label="Edge" sortField="predicted" /></div>
            <SortHeader label="E/V" sortField="edge_vol" />
            <div className="col-hide-mobile" style={{ padding: "9px 8px", fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tier</div>
            <div style={{ padding: "9px 8px", fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>Dir</div>
            <SortHeader label="Actual" sortField="actual" />
            <SortHeader label="Result" sortField="result" />
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>No picks match these filters.</div>
              <button onClick={() => { setRoundFilter("ALL"); setPosFilter("ALL"); setTierFilter("ALL"); setResultFilter("ALL"); }}
                style={{ background: "#f97316", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#000" }}>
                Reset Filters
              </button>
            </div>
          )}

          {filtered.map((p, idx) => {
            const line = getLine(p);
            const dir = getDir(p);
            const edge = getEdge(p);
            const tier = getTier(p.edge_vol);
            const isWin = p.result === "WIN";
            return (
              <div
                key={`${p.player}-${p.round}-${idx}`}
                className="track-row"
                onClick={() => setOpenPick(openPick?.player === p.player && openPick?.round === p.round && openPick === p ? null : p)}
                style={{
                  display: "grid", gridTemplateColumns: GRID,
                  borderBottom: "1px solid #0a0a0a", alignItems: "center",
                  background: isWin ? "rgba(34,197,94,0.02)" : "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background = isWin ? "rgba(34,197,94,0.02)" : "transparent")}
              >
                <div style={{ padding: "8px 8px", display: "flex", justifyContent: "center" }}>
                  <Avatar name={p.player} team={p.team} />
                </div>
                <div style={{ padding: "8px 8px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e0e0e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.player}</div>
                  <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>{p.team}</div>
                </div>
                <div style={{ padding: "8px 8px", fontSize: 11, color: "#555" }}>R{p.round}</div>
                <div style={{ padding: "8px 8px" }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: POS_COLORS[p.position] ?? "#888",
                    background: "#111", borderRadius: 3, padding: "1px 4px",
                  }}>{p.position}</span>
                </div>
                <div style={{ padding: "8px 8px", fontSize: 11, color: "#666" }}>{p.opponent ?? "—"}</div>
                <div style={{ padding: "8px 8px", fontSize: 12, fontWeight: 600, color: "#888" }}>{line}</div>
                <div className="col-hide-mobile" style={{ padding: "8px 8px", fontSize: 12, fontWeight: 600, color: "#f97316" }}>{p.predicted}</div>
                <div className="col-hide-mobile" style={{ padding: "8px 8px", fontSize: 12, fontWeight: 600, color: edge >= 0 ? "#22c55e" : "#ef4444" }}>
                  {edge >= 0 ? "+" : ""}{edge}
                </div>
                <div style={{ padding: "8px 8px", fontSize: 11, color: "#888" }}>{p.edge_vol.toFixed(2)}</div>
                <div className="col-hide-mobile" style={{ padding: "8px 8px" }}><TierBadge tier={tier} /></div>
                <div style={{ padding: "8px 8px", fontSize: 11, fontWeight: 700, color: dir === "OVER" ? "#22c55e" : "#ef4444" }}>
                  {dir} {dir === "OVER" ? "⬆" : "⬇"}
                </div>
                <div style={{ padding: "8px 8px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.actual}</div>
                <div style={{ padding: "8px 8px", fontSize: 11, fontWeight: 800, color: isWin ? "#22c55e" : "#ef4444" }}>
                  {isWin ? "✓" : "✗"} {p.result}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail drawer */}
        {openPick && (() => {
          const p = openPick;
          const line = getLine(p);
          const dir = getDir(p);
          const edge = getEdge(p);
          const tier = getTier(p.edge_vol);
          const isWin = p.result === "WIN";
          return (
            <>
              <div onClick={() => setOpenPick(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
              <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 400,
                width: 360, maxWidth: "90vw", background: "#0a0a0a",
                borderLeft: "1px solid #1a1a1a", overflowY: "auto", padding: 24,
              }}>
                <button onClick={() => setOpenPick(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>✕</button>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <Avatar name={p.player} team={p.team} />
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f0f0" }}>{p.player}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{p.team} · {p.position} · Round {p.round}</div>
                  </div>
                </div>
                <div style={{ borderRadius: 8, padding: "12px 14px", marginBottom: 18, background: isWin ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${isWin ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: isWin ? "#22c55e" : "#ef4444" }}>{isWin ? "✓ WIN" : "✗ LOSS"}</span>
                  <TierBadge tier={tier} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                  {[
                    { label: "Line", value: line },
                    { label: "Actual", value: p.actual },
                    { label: "Model", value: p.predicted },
                    { label: "Edge", value: `${edge >= 0 ? "+" : ""}${edge}` },
                    { label: "E/V", value: p.edge_vol.toFixed(3) },
                    { label: "Direction", value: dir },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#111", borderRadius: 6, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#888" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {p.opponent && (
                  <div style={{ background: "#111", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Context</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#555" }}>Opponent</span>
                      <span style={{ fontSize: 12, color: "#888" }}>{p.opponent}</span>
                    </div>
                  </div>
                )}
                <div style={{ padding: "10px 14px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 11, color: "#555" }}>
                  Verified against Wheeloratings actual disposals
                </div>
                <button onClick={() => setOpenPick(null)} style={{ width: "100%", background: "none", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px", fontSize: 11, color: "#555", cursor: "pointer", marginTop: 8 }}>Close</button>
              </div>
            </>
          );
        })()}

        {/* Disclaimer */}
        <div style={{ marginTop: 24, padding: "14px 18px", background: "#080808", border: "1px solid #111", borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: "#555", lineHeight: 1.8 }}>
            <strong style={{ color: "#666" }}>Disclaimer:</strong> SportSphere HQ provides analytical data only. Nothing here is financial or betting advice. Past model performance does not guarantee future results. You must be 18+ to bet. National Gambling Helpline: <strong style={{ color: "#666" }}>1800 858 858</strong>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
