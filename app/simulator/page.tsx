"use client";
// TODO: Gate behind Pro subscription in Phase 3

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import {
  DEFAULT_WEIGHTS, OPTIMISED_WEIGHTS,
  simulateAllPicks, calcSimStats, calcOriginalStats,
  type ModelWeights, type SimulatedPick, type SimStats, type RawHistoricalPick,
} from "@/lib/model-engine";
import resultsData from "@/data/results.json";
import { roundsLabel, currentSeason } from "@/lib/siteData";

// ── Synthesise raw_inputs for picks that don't have them ─────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function synthesizeRawInputs(p: any): import("@/lib/model-engine").RawInputs {
  const line: number = p.bookie_line ?? p.line ?? 20;
  const predicted: number = p.predicted ?? line;
  const edgeVol: number = p.edge_vol ?? 0;
  const absEdge = Math.abs(predicted - line);
  const stdDev = edgeVol > 0 && absEdge > 0 ? absEdge / edgeVol : 4.5;
  return {
    avg_2025: predicted,
    avg_2026: predicted,
    opp_adjustment_factor: 1.0,
    tog_rate: 0.82,
    team_style_index: 0,
    cba_pct: 0.35,
    league_avg_cba: 0.35,
    play_style: "HYBRID",
    condition: "Dry",
    expected_tog: 0.82,
    rules_boost: 1.02,
    current_round: p.round ?? 3,
    std_dev: Math.max(1.0, stdDev),
  };
}

// ── Build full 611-pick dataset from results.json ────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL_EXTENDED: RawHistoricalPick[] = (resultsData.rounds as any[]).flatMap((r) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  r.picks.map((p: any) => {
    const pick = { ...p, round: r.round };
    if (!pick.raw_inputs) pick.raw_inputs = synthesizeRawInputs(pick);
    if (!pick.signal) pick.signal = p.direction ?? "OVER";
    if (!pick.line) pick.line = p.bookie_line ?? 0;
    return pick;
  })
);

// ── Hardcoded baseline from results.json season_summary (always full 611) ────
const SS = resultsData.season_summary;
const BASELINE_STATS: import("@/lib/model-engine").SimStats = {
  total: SS.total_picks,
  totalWins: Math.round(SS.total_picks * SS.overall_rate / 100),
  totalWinRate: SS.overall_rate,
  filteredTotal: SS.filtered_picks,
  filteredWins: SS.filtered_wins,
  filteredWinRate: SS.filtered_rate,
  strongTotal: SS.strong_picks,
  strongWins: SS.strong_wins,
  strongWinRate: SS.strong_rate,
};

const ORIGINAL_STATS = calcOriginalStats(ALL_EXTENDED);

// ── Grid search space (~46,656 combinations) ─────────────────────────────────
const GRID = {
  w_2025:                [0.20, 0.25, 0.30, 0.35, 0.40, 0.45],
  opp_sensitivity:       [0.10, 0.15, 0.20, 0.25, 0.30, 0.35],
  tog_sensitivity:       [0.25, 0.30, 0.35, 0.40, 0.45, 0.50],
  stop_multiplier_dry:   [0.83, 0.86, 0.89, 0.92, 0.95, 0.98],
  strong_threshold_mid:  [2.0,  2.5,  3.0,  3.5,  4.0,  4.5],
  play_style_sensitivity:[0.40, 0.50, 0.60, 0.70, 0.80, 0.90],
};
const TOTAL_COMBOS = Object.values(GRID).reduce((a, v) => a * v.length, 1);

// ── Scenario presets ─────────────────────────────────────────────────────────
const PRESET_DATA_OPTIMISED: ModelWeights = {
  ...DEFAULT_WEIGHTS,
  edge_vol_threshold: 0.70,
};

const PRESET_ADELAIDE_OVAL: ModelWeights = {
  ...DEFAULT_WEIGHTS,
  opp_sensitivity: 0.30, tog_sensitivity: 0.45,
  strong_threshold_mid: 2.5, edge_vol_threshold: 0.45,
};
const PRESET_WET_WEATHER: ModelWeights = {
  ...DEFAULT_WEIGHTS,
  stop_multiplier_wet: 1.10, trans_multiplier_wet: 0.90,
  strong_threshold_mid: 3.5, edge_vol_threshold: 0.60,
};
const PRESET_STOP_PLAYERS: ModelWeights = {
  ...DEFAULT_WEIGHTS,
  opp_sensitivity: 0.35, stop_multiplier_dry: 0.83, play_style_sensitivity: 0.75,
};
const PRESET_PREMIUM_LINES: ModelWeights = {
  ...DEFAULT_WEIGHTS,
  premium_line_threshold: 25, premium_edge_bonus: 3.0, edge_vol_threshold: 0.55,
};

// ── Saved config types ───────────────────────────────────────────────────────
interface SavedConfig {
  id: string;
  name: string;
  weights: ModelWeights;
  filteredWR: number;
  filteredTotal: number;
  savedAt: string;
}

// ── Slider component ─────────────────────────────────────────────────────────
function SliderControl({
  label, value, min, max, step, onChange, format, hint,
}: {
  label: string; value: number; min: number; max: number;
  step: number; onChange: (v: number) => void;
  format?: (v: number) => string; hint?: string;
}) {
  const fmt = format ?? ((v: number) => v.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#666" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316", minWidth: 36, textAlign: "right" }}>
          {fmt(value)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
      {hint && <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

// ── Collapsible section ──────────────────────────────────────────────────────
function SectionPanel({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16, borderBottom: "1px solid #111" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "none", border: "none",
          padding: "10px 0", cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: "#555" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ paddingBottom: 12 }}>{children}</div>}
    </div>
  );
}

// ── Number ticker ─────────────────────────────────────────────────────────────
function TickerNumber({ target, fmt }: { target: number; fmt: (v: number) => string }) {
  const [displayed, setDisplayed] = useState(target);
  const prev = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current === target) return;
    const from = prev.current;
    prev.current = target;
    const startTime = performance.now();
    const DURATION = 320;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / DURATION);
      const eased = 1 - Math.pow(1 - t, 2);
      setDisplayed(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else { setDisplayed(target); rafRef.current = null; }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <>{fmt(displayed)}</>;
}

// ── Comparison row ───────────────────────────────────────────────────────────
function CompareRow({ label, original, simulated, isCount = false }: {
  label: string; original: number; simulated: number; isCount?: boolean;
}) {
  const delta = simulated - original;
  const fmt = isCount ? (v: number) => String(Math.round(v)) : (v: number) => `${v.toFixed(1)}%`;
  const deltaColor = delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#666";
  const deltaStr = isCount
    ? `${delta >= 0 ? "+" : ""}${Math.round(delta)}`
    : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 90px 90px 90px",
      gap: 8, padding: "8px 12px", borderBottom: "1px solid #0a0a0a", alignItems: "center",
    }}>
      <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#555", textAlign: "right" }}>{fmt(original)}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", textAlign: "right" }}>
        <TickerNumber target={simulated} fmt={fmt} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: deltaColor, textAlign: "right" }}>
        {deltaStr} {arrow}
      </span>
    </div>
  );
}

// ── Key insight generator ────────────────────────────────────────────────────
function generateInsight(orig: SimStats, sim: SimStats): string {
  const filteredDelta = sim.filteredWinRate - orig.filteredWinRate;
  const strongDelta = sim.strongWinRate - orig.strongWinRate;
  const countDelta = sim.filteredTotal - orig.filteredTotal;
  if (Math.abs(filteredDelta) < 0.5 && Math.abs(strongDelta) < 0.5)
    return "Your configuration produces similar results to the live model. Try adjusting the STRONG thresholds or opp sensitivity for a bigger impact.";
  if (filteredDelta > 3 && countDelta < -3)
    return `Filtered win rate improves by ${filteredDelta.toFixed(1)}% but reduces actionable picks by ${Math.abs(countDelta)}. Fewer, sharper picks — consider if that suits your approach.`;
  if (filteredDelta > 2)
    return `Filtered win rate improves by ${filteredDelta.toFixed(1)}% with ${countDelta >= 0 ? "no reduction" : `${Math.abs(countDelta)} fewer`} actionable picks. Strong configuration.`;
  if (filteredDelta < -2)
    return `Filtered win rate drops ${Math.abs(filteredDelta).toFixed(1)}%. This configuration is weaker than the current model — try reducing opp sensitivity or adjusting the season blend.`;
  if (strongDelta > 3)
    return `STRONG tier accuracy improves by ${strongDelta.toFixed(1)}% under this configuration. Threshold and sensitivity changes are working well together.`;
  return `Configuration differs from live model. Filtered rate: ${filteredDelta >= 0 ? "+" : ""}${filteredDelta.toFixed(1)}%, STRONG rate: ${strongDelta >= 0 ? "+" : ""}${strongDelta.toFixed(1)}%.`;
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchStartWeightsRef = useRef<ModelWeights>(DEFAULT_WEIGHTS);

  const [pendingWeights, setPendingWeights] = useState<ModelWeights>(DEFAULT_WEIGHTS);
  const [weights, setWeights] = useState<ModelWeights>(DEFAULT_WEIGHTS);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [roundFilter, setRoundFilter] = useState<number | "ALL">("ALL");
  const [positionFilter, setPositionFilter] = useState<"ALL" | "MID" | "DEF" | "FWD" | "RUCK">("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<"ALL" | "LOSS_WIN" | "WIN_LOSS">("ALL");
  const [showFullTable, setShowFullTable] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const PAGE_SIZE = 20;

  // ── Slider animation ──────────────────────────────────────────────────────
  function animateToWeights(target: ModelWeights, from: ModelWeights) {
    const startTime = performance.now();
    const DURATION = 800;
    function frame(now: number) {
      const t = Math.min(1, (now - startTime) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const interp = Object.fromEntries(
        (Object.keys(target) as Array<keyof ModelWeights>).map(k => [
          k, from[k] + (target[k] - from[k]) * eased,
        ])
      ) as unknown as ModelWeights;
      setPendingWeights(interp);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        setPendingWeights(target);
        setWeights(target);
      }
    }
    requestAnimationFrame(frame);
  }

  // ── Grid search ───────────────────────────────────────────────────────────
  const runGridSearch = useCallback(() => {
    setIsSearching(true);
    setSearchProgress(0);
    searchStartWeightsRef.current = { ...pendingWeights };

    const combos: Partial<ModelWeights>[] = [];
    for (const w25 of GRID.w_2025)
      for (const opp of GRID.opp_sensitivity)
        for (const tog of GRID.tog_sensitivity)
          for (const stop of GRID.stop_multiplier_dry)
            for (const thr of GRID.strong_threshold_mid)
              for (const ps of GRID.play_style_sensitivity)
                combos.push({
                  w_2025: w25, w_2026: Math.round((1 - w25) * 100) / 100,
                  opp_sensitivity: opp, tog_sensitivity: tog,
                  stop_multiplier_dry: stop, strong_threshold_mid: thr,
                  play_style_sensitivity: ps,
                });

    const CHUNK = 500;
    let idx = 0;
    let bestScore = -1;
    let bestW: ModelWeights = { ...DEFAULT_WEIGHTS };
    const snap = searchStartWeightsRef.current;

    function processChunk() {
      const end = Math.min(idx + CHUNK, combos.length);
      for (; idx < end; idx++) {
        const testW: ModelWeights = { ...DEFAULT_WEIGHTS, ...combos[idx] };
        const sim = simulateAllPicks(ALL_EXTENDED, testW);
        const stats = calcSimStats(sim, testW);
        // Maximise filtered win rate, tiebreak by count
        const score = stats.filteredWinRate * 10 + stats.filteredTotal;
        if (score > bestScore) { bestScore = score; bestW = testW; }
      }
      setSearchProgress(Math.round(idx / combos.length * 100));
      if (idx < combos.length) {
        setTimeout(processChunk, 0);
      } else {
        setIsSearching(false);
        animateToWeights(bestW, snap);
      }
    }
    setTimeout(processChunk, 0);
  }, [pendingWeights]);

  const updateWeight = useCallback((key: keyof ModelWeights, value: number) => {
    const updated = { ...pendingWeights, [key]: value };
    if (key === "w_2025") updated.w_2026 = Math.round((1 - value) * 100) / 100;
    if (key === "w_2026") updated.w_2025 = Math.round((1 - value) * 100) / 100;
    setPendingWeights(updated);
    setIsRecalculating(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setWeights(updated);
      setIsRecalculating(false);
    }, 150);
  }, [pendingWeights]);

  const resetToDefault = useCallback(() => {
    setPendingWeights(DEFAULT_WEIGHTS);
    setWeights(DEFAULT_WEIGHTS);
  }, []);

  const resetToOptimised = useCallback(() => {
    setPendingWeights(OPTIMISED_WEIGHTS);
    setWeights(OPTIMISED_WEIGHTS);
  }, []);

  const roundNums = [...new Set(ALL_EXTENDED.map(p => p.round))].sort() as number[];

  const filteredHistorical = useMemo(() => {
    let picks = roundFilter === "ALL" ? ALL_EXTENDED : ALL_EXTENDED.filter(p => p.round === roundFilter);
    if (positionFilter !== "ALL") picks = picks.filter(p => p.position === positionFilter);
    return picks;
  }, [roundFilter, positionFilter]);

  const simulatedPicks = useMemo(
    () => simulateAllPicks(filteredHistorical, weights),
    [filteredHistorical, weights]
  );

  const simStats = useMemo(() => calcSimStats(simulatedPicks, weights), [simulatedPicks, weights]);

  const origStatsForFilter = useMemo(
    () => calcOriginalStats(filteredHistorical),
    [filteredHistorical]
  );

  const exportConfig = useCallback(() => {
    const payload = {
      exported_at: new Date().toISOString(),
      season: "2026",
      picks_analyzed: ALL_EXTENDED.length,
      weights,
      performance: {
        filtered_win_rate: `${simStats.filteredWinRate}%`,
        strong_win_rate: `${simStats.strongWinRate}%`,
        overall_win_rate: `${simStats.totalWinRate}%`,
        filtered_picks: simStats.filteredTotal,
        strong_picks: simStats.strongTotal,
        vs_baseline: {
          filtered_delta: `${simStats.filteredWinRate - origStatsForFilter.filteredWinRate >= 0 ? "+" : ""}${(simStats.filteredWinRate - origStatsForFilter.filteredWinRate).toFixed(1)}%`,
          strong_delta: `${simStats.strongWinRate - origStatsForFilter.strongWinRate >= 0 ? "+" : ""}${(simStats.strongWinRate - origStatsForFilter.strongWinRate).toFixed(1)}%`,
        },
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sportstphere_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [weights, simStats, origStatsForFilter]);

  const positions = ["MID", "DEF", "FWD", "RUCK"];
  const positionStats = useMemo(() => positions.map(pos => {
    const origPicks = filteredHistorical.filter(p => p.position === pos);
    const simPicks = simulatedPicks.filter(p => p.position === pos);
    const origWins = origPicks.filter(p => p.result === "WIN").length;
    const simWins = simPicks.filter(p => p.new_result === "WIN").length;
    return {
      pos,
      origTotal: origPicks.length,
      origWins,
      origRate: origPicks.length ? Math.round(origWins / origPicks.length * 1000) / 10 : 0,
      simTotal: simPicks.length,
      simWins,
      simRate: simPicks.length ? Math.round(simWins / simPicks.length * 1000) / 10 : 0,
    };
  }), [filteredHistorical, simulatedPicks]);

  const roundStats = useMemo(() => roundNums.map(rnd => {
    const origRound = (resultsData.rounds as any[]).find(r => r.round === rnd);
    const simPicks = simulateAllPicks(ALL_EXTENDED.filter(p => p.round === rnd), weights);
    const simWins = simPicks.filter(p => p.new_result === "WIN").length;
    return {
      rnd,
      totalPicks: origRound?.total_picks ?? 0,
      origRate: origRound?.win_rate ?? 0,
      simPicksLen: simPicks.length,
      simWins,
      simRate: simPicks.length ? Math.round(simWins / simPicks.length * 1000) / 10 : 0,
    };
  }), [weights]);

  const changedPicks = useMemo(() => simulatedPicks.filter(p => {
    if (outcomeFilter === "LOSS_WIN") return p.outcome_changed && p.new_result === "WIN";
    if (outcomeFilter === "WIN_LOSS") return p.outcome_changed && p.new_result === "LOSS";
    return p.outcome_changed || p.confidence_changed;
  }), [simulatedPicks, outcomeFilter]);

  const paginatedPicks = useMemo(() => {
    const start = tablePage * PAGE_SIZE;
    return simulatedPicks.slice(start, start + PAGE_SIZE);
  }, [simulatedPicks, tablePage]);

  const insight = useMemo(() => generateInsight(origStatsForFilter, simStats), [origStatsForFilter, simStats]);

  // Load saved configs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ss_sim_configs");
      if (stored) setSavedConfigs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Bias stats
  const biasStats = useMemo(() => {
    const biases = simulatedPicks.map(p => p.new_predicted - p.actual);
    const avgBias = biases.length ? biases.reduce((a, b) => a + b, 0) / biases.length : 0;
    const overPicks = simulatedPicks.filter(p => p.new_signal === "OVER");
    const underPicks = simulatedPicks.filter(p => p.new_signal === "UNDER");
    const overWR = overPicks.length ? overPicks.filter(p => p.new_result === "WIN").length / overPicks.length * 100 : 0;
    const underWR = underPicks.length ? underPicks.filter(p => p.new_result === "WIN").length / underPicks.length * 100 : 0;
    const byPosition = ["MID", "DEF", "FWD", "RUCK"].map(pos => {
      const picks = simulatedPicks.filter(p => p.position === pos);
      const bias = picks.length ? picks.reduce((a, p) => a + (p.new_predicted - p.actual), 0) / picks.length : 0;
      return { pos, bias: Math.round(bias * 100) / 100, count: picks.length };
    });
    return { avgBias: Math.round(avgBias * 100) / 100, overWR: Math.round(overWR * 10) / 10, underWR: Math.round(underWR * 10) / 10, byPosition };
  }, [simulatedPicks]);

  // Condition breakdown
  const conditionStats = useMemo(() => {
    const conditions = ["Dry", "Wet", "Roof"] as const;
    return conditions.map(cond => {
      const idxs = filteredHistorical
        .map((p, i) => p.raw_inputs?.condition === cond ? i : -1)
        .filter(i => i >= 0);
      const picks = idxs.map(i => simulatedPicks[i]).filter(Boolean);
      const wins = picks.filter(p => p.new_result === "WIN").length;
      return {
        cond,
        count: picks.length,
        winRate: picks.length ? Math.round(wins / picks.length * 1000) / 10 : 0,
      };
    });
  }, [filteredHistorical, simulatedPicks]);

  // Change summary
  const changeSummary = useMemo(() => {
    const lossToWin = simulatedPicks.filter(p => p.outcome_changed && p.original_result === "LOSS" && p.new_result === "WIN");
    const winToLoss = simulatedPicks.filter(p => p.outcome_changed && p.original_result === "WIN" && p.new_result === "LOSS");
    function dominant(picks: typeof simulatedPicks, field: (p: typeof picks[0]) => string): string | null {
      const counts: Record<string, number> = {};
      for (const p of picks) { const v = field(p); counts[v] = (counts[v] ?? 0) + 1; }
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (!top || top[1] < picks.length * 0.5) return null;
      return top[0];
    }
    return {
      lossToWin: lossToWin.slice(0, 3),
      winToLoss: winToLoss.slice(0, 3),
      ltwCount: lossToWin.length,
      wtlCount: winToLoss.length,
      ltwPattern: dominant(lossToWin, p => p.position),
      wtlPattern: dominant(winToLoss, p => p.position),
    };
  }, [simulatedPicks]);

  const saveConfig = useCallback(() => {
    const name = prompt("Name this configuration:");
    if (!name) return;
    const config: SavedConfig = {
      id: Date.now().toString(),
      name,
      weights: { ...weights },
      filteredWR: simStats.filteredWinRate,
      filteredTotal: simStats.filteredTotal,
      savedAt: new Date().toLocaleDateString("en-AU"),
    };
    setSavedConfigs(prev => {
      const updated = [config, ...prev].slice(0, 5);
      localStorage.setItem("ss_sim_configs", JSON.stringify(updated));
      return updated;
    });
  }, [weights, simStats]);

  const deleteConfig = useCallback((id: string) => {
    setSavedConfigs(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem("ss_sim_configs", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const w = pendingWeights;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <style>{`
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 4px; background: #1a1a1a; border-radius: 2px; outline: none; cursor: pointer; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #f97316; border-radius: 50%; cursor: pointer; }
        input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; background: #f97316; border-radius: 50%; cursor: pointer; border: none; }
        @media (max-width: 860px) {
          .sim-layout { grid-template-columns: 1fr !important; }
          .sim-left { position: static !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Model tool
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Weight Optimisation Simulator
          </h1>
          <p style={{ fontSize: 13, color: "#777", margin: 0, maxWidth: 560 }}>
            Adjust model weights and see how accuracy changes across {ALL_EXTENDED.length} picks from Rounds {roundNums[0]}–{roundNums[roundNums.length - 1]}. Run a grid search over {TOTAL_COMBOS.toLocaleString()} combinations to find optimal parameters.
          </p>
        </div>

        <div className="sim-layout" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>

          {/* ── LEFT PANEL ── */}
          <div className="sim-left" style={{ position: "sticky", top: 84 }}>
            <div style={{
              background: "#080808", border: "1px solid #111",
              borderRadius: 12, padding: "16px 18px",
              maxHeight: "calc(100vh - 120px)", overflowY: "auto",
            }}>
              <div style={{ fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Weight Controls
              </div>

              <SectionPanel title="Season Blend">
                <SliderControl
                  label="2025 Season Weight"
                  value={w.w_2025} min={0} max={1} step={0.05}
                  format={v => `2025: ${Math.round(v * 100)}% · 2026: ${Math.round((1 - v) * 100)}%`}
                  onChange={v => updateWeight("w_2025", v)}
                  hint="Round 6 live blend: 35/65"
                />
              </SectionPanel>

              <SectionPanel title="Factor Sensitivities">
                <SliderControl label="Opponent Adjustment" value={w.opp_sensitivity} min={0} max={1} step={0.05}
                  format={v => v.toFixed(2)} onChange={v => updateWeight("opp_sensitivity", v)} />
                <SliderControl label="TOG-Adjusted Rate" value={w.tog_sensitivity} min={0} max={1} step={0.05}
                  format={v => v.toFixed(2)} onChange={v => updateWeight("tog_sensitivity", v)} />
                <SliderControl label="CBA / Form" value={w.cba_sensitivity} min={0} max={0.5} step={0.05}
                  format={v => v.toFixed(2)} onChange={v => updateWeight("cba_sensitivity", v)} />
                <SliderControl label="Play Style Factor" value={w.play_style_sensitivity} min={0} max={1} step={0.05}
                  format={v => v.toFixed(2)} onChange={v => updateWeight("play_style_sensitivity", v)} />
                <SliderControl label="Team Style Index" value={w.team_style_sensitivity} min={0} max={0.20} step={0.01}
                  format={v => v.toFixed(2)} onChange={v => updateWeight("team_style_sensitivity", v)} />
              </SectionPanel>

              <SectionPanel title="Play Style Multipliers" defaultOpen={false}>
                <SliderControl label="TRANS (dry)" value={w.trans_multiplier_dry} min={0.90} max={1.15} step={0.01}
                  format={v => `×${v.toFixed(2)}`} onChange={v => updateWeight("trans_multiplier_dry", v)} />
                <SliderControl label="STOP (dry)" value={w.stop_multiplier_dry} min={0.75} max={1.00} step={0.01}
                  format={v => `×${v.toFixed(2)}`} onChange={v => updateWeight("stop_multiplier_dry", v)} />
                <SliderControl label="TRANS (wet)" value={w.trans_multiplier_wet} min={0.85} max={1.00} step={0.01}
                  format={v => `×${v.toFixed(2)}`} onChange={v => updateWeight("trans_multiplier_wet", v)} />
                <SliderControl label="STOP (wet)" value={w.stop_multiplier_wet} min={0.95} max={1.15} step={0.01}
                  format={v => `×${v.toFixed(2)}`} onChange={v => updateWeight("stop_multiplier_wet", v)} />
              </SectionPanel>

              <SectionPanel title="CBA Dampening" defaultOpen={false}>
                <SliderControl label="CBA Dampening" value={w.cba_dampening} min={0} max={0.5} step={0.01}
                  format={v => v.toFixed(2)} onChange={v => updateWeight("cba_dampening", v)} />
              </SectionPanel>

              <SectionPanel title="Edge Thresholds" defaultOpen={false}>
                <SliderControl label="STRONG — MID" value={w.strong_threshold_mid} min={1.5} max={5.0} step={0.25}
                  format={v => `${v.toFixed(2)} disp`} onChange={v => updateWeight("strong_threshold_mid", v)} />
                <SliderControl label="STRONG — DEF" value={w.strong_threshold_def} min={1.5} max={5.0} step={0.25}
                  format={v => `${v.toFixed(2)} disp`} onChange={v => updateWeight("strong_threshold_def", v)} />
                <SliderControl label="STRONG — FWD" value={w.strong_threshold_fwd} min={2.0} max={7.0} step={0.25}
                  format={v => `${v.toFixed(2)} disp`} onChange={v => updateWeight("strong_threshold_fwd", v)}
                  hint="FWDs excluded from bet filter regardless" />
                <SliderControl label="STRONG — RUCK" value={w.strong_threshold_ruck} min={2.0} max={7.0} step={0.25}
                  format={v => `${v.toFixed(2)} disp`} onChange={v => updateWeight("strong_threshold_ruck", v)} />
                <SliderControl label="Premium line threshold" value={w.premium_line_threshold} min={20} max={35} step={1}
                  format={v => `≥${v} disp`} onChange={v => updateWeight("premium_line_threshold", v)} />
                <SliderControl label="Premium edge bonus" value={w.premium_edge_bonus} min={0} max={4.0} step={0.25}
                  format={v => `+${v.toFixed(2)} disp`} onChange={v => updateWeight("premium_edge_bonus", v)} />
                <SliderControl label="Edge/Vol threshold" value={w.edge_vol_threshold} min={0.30} max={0.80} step={0.05}
                  format={v => `≥${v.toFixed(2)}`} onChange={v => updateWeight("edge_vol_threshold", v)} />
              </SectionPanel>

              {/* Position Filter */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Position Filter
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(["ALL", "MID", "DEF", "FWD", "RUCK"] as const).map(pos => (
                    <button key={pos} onClick={() => setPositionFilter(pos)} style={{
                      padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                      border: positionFilter === pos ? "1px solid #f97316" : "1px solid #111",
                      background: positionFilter === pos ? "#f97316" : "#0a0a0a",
                      color: positionFilter === pos ? "#000" : "#555",
                    }}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Filter */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Round Filter
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(["ALL", ...roundNums] as (number | "ALL")[]).map(r => (
                    <button key={r} onClick={() => setRoundFilter(r)} style={{
                      padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                      border: roundFilter === r ? "1px solid #f97316" : "1px solid #111",
                      background: roundFilter === r ? "#f97316" : "#0a0a0a",
                      color: roundFilter === r ? "#000" : "#555",
                    }}>
                      {r === "ALL" ? "All" : `R${r}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8, borderTop: "1px solid #111" }}>
                <button onClick={resetToDefault} style={{
                  background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6,
                  padding: "7px 12px", fontSize: 11, color: "#555", cursor: "pointer", textAlign: "left",
                }}>
                  ↺ Reset to Current Model
                </button>
                <button onClick={resetToOptimised} disabled={isSearching} style={{
                  background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6,
                  padding: "7px 12px", fontSize: 11, color: "#888", cursor: "pointer", textAlign: "left",
                  opacity: isSearching ? 0.4 : 1,
                }}>
                  ★ Apply Preset Optimal
                </button>

                {/* Grid search button / progress */}
                {isSearching ? (
                  <div style={{ padding: "7px 12px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#f97316" }}>Searching... {searchProgress}%</span>
                      <span style={{ fontSize: 10, color: "#666" }}>
                        {Math.round(searchProgress / 100 * TOTAL_COMBOS).toLocaleString()} / {TOTAL_COMBOS.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${searchProgress}%`,
                        background: "linear-gradient(90deg, #f97316, #fb923c)",
                        borderRadius: 2, transition: "width 0.15s",
                      }} />
                    </div>
                  </div>
                ) : (
                  <button onClick={runGridSearch} style={{
                    background: "#0a0800", border: "1px solid #f9731640", borderRadius: 6,
                    padding: "7px 12px", fontSize: 11, color: "#f97316", cursor: "pointer", textAlign: "left",
                  }}>
                    ⚡ Run Grid Search ({TOTAL_COMBOS.toLocaleString()} combos)
                  </button>
                )}

                <button onClick={exportConfig} disabled={isSearching} style={{
                  background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6,
                  padding: "7px 12px", fontSize: 11, color: "#555", cursor: "pointer", textAlign: "left",
                  opacity: isSearching ? 0.4 : 1,
                }}>
                  ↓ Export Configuration JSON
                </button>
                <button onClick={saveConfig} style={{
                  background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6,
                  padding: "7px 12px", fontSize: 11, color: "#888", cursor: "pointer", textAlign: "left",
                }}>
                  💾 Save Config
                </button>
              </div>

              {/* Scenario presets */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #111" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Scenario Presets
                </div>
                {[
                  { label: "★ Data-Optimised (69%+)", note: "E/V ≥ 0.70 · 42 picks · 69.0% hist rate", preset: PRESET_DATA_OPTIMISED },
                  { label: "Adelaide Oval", note: "Optimised for AO picks", preset: PRESET_ADELAIDE_OVAL },
                  { label: "Wet Weather", note: "Optimised for wet conditions", preset: PRESET_WET_WEATHER },
                  { label: "STOP Players", note: "High opp sensitivity", preset: PRESET_STOP_PLAYERS },
                  { label: "Premium Lines", note: "High edge threshold", preset: PRESET_PREMIUM_LINES },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => animateToWeights(p.preset, pendingWeights)}
                    style={{
                      width: "100%", background: "#0a0a0a", border: "1px solid #111", borderRadius: 5,
                      padding: "6px 10px", fontSize: 11, color: "#888", cursor: "pointer",
                      textAlign: "left", marginBottom: 4,
                    }}
                  >
                    <div>{p.label}</div>
                    <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>{p.note}</div>
                  </button>
                ))}
              </div>

              {/* Saved configs */}
              {savedConfigs.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #111" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Saved Configs
                  </div>
                  {savedConfigs.map(cfg => (
                    <div key={cfg.id} style={{
                      background: "#050505", border: "1px solid #0d0d0d", borderRadius: 5,
                      padding: "8px 10px", marginBottom: 6,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>{cfg.name}</div>
                          <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>
                            {cfg.filteredWR.toFixed(1)}% · {cfg.filteredTotal} picks · {cfg.savedAt}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteConfig(cfg.id)}
                          style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 12, padding: "0 2px" }}
                        >×</button>
                      </div>
                      <button
                        onClick={() => animateToWeights(cfg.weights, pendingWeights)}
                        style={{
                          marginTop: 6, width: "100%", background: "#0a0a0a", border: "1px solid #111",
                          borderRadius: 4, padding: "3px 0", fontSize: 10, color: "#666", cursor: "pointer",
                        }}
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div>
            {isRecalculating && (
              <div style={{ fontSize: 10, color: "#f97316", marginBottom: 8, letterSpacing: "0.06em" }}>
                Recalculating...
              </div>
            )}

            {/* Comparison header */}
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 90px 90px 90px",
                gap: 8, padding: "10px 12px", borderBottom: "1px solid #111",
              }}>
                {["Metric", "Current Model", "Your Config", "Delta"].map(h => (
                  <span key={h} style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h !== "Metric" ? "right" : "left" }}>
                    {h}
                  </span>
                ))}
              </div>
              <CompareRow label="Filtered Win Rate" original={BASELINE_STATS.filteredWinRate} simulated={simStats.filteredWinRate} />
              <CompareRow label="STRONG Win Rate" original={BASELINE_STATS.strongWinRate} simulated={simStats.strongWinRate} />
              <CompareRow label="Overall Win Rate" original={BASELINE_STATS.totalWinRate} simulated={simStats.totalWinRate} />
              <CompareRow label="Filtered Picks" original={BASELINE_STATS.filteredTotal} simulated={simStats.filteredTotal} isCount />
              <CompareRow label="STRONG Picks" original={BASELINE_STATS.strongTotal} simulated={simStats.strongTotal} isCount />
            </div>

            {/* Key insight */}
            <div style={{
              background: "#0a0800", border: "1px solid #f9731620",
              borderRadius: 8, padding: "12px 14px", marginBottom: 16,
              fontSize: 12, color: "#888", lineHeight: 1.7,
            }}>
              <span style={{ color: "#f97316", fontWeight: 700 }}>Insight: </span>
              {insight}
            </div>

            {/* Prediction Bias */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Prediction Bias
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
                {[
                  { label: "Avg Bias", value: `${biasStats.avgBias >= 0 ? "+" : ""}${biasStats.avgBias}`, hint: "disp" },
                  { label: "OVER Win Rate", value: `${biasStats.overWR}%`, hint: "picks" },
                  { label: "UNDER Win Rate", value: `${biasStats.underWR}%`, hint: "picks" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid #111" : "none" }}>
                    <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#f97316" }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 14px", borderTop: "1px solid #0a0a0a" }}>
                <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Bias by Position</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                  {biasStats.byPosition.map(bp => (
                    <div key={bp.pos} style={{ textAlign: "center", padding: "6px" }}>
                      <div style={{ fontSize: 9, color: "#555", marginBottom: 2 }}>{bp.pos}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: bp.bias > 1 ? "#f87171" : bp.bias < -1 ? "#4ade80" : "#888" }}>
                        {bp.bias >= 0 ? "+" : ""}{bp.bias}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {biasStats.avgBias > 1 && (
                <div style={{ padding: "8px 14px", background: "rgba(69,10,10,0.3)", fontSize: 11, color: "#f87171" }}>
                  Model is over-predicting by &gt;1 disposal on average. Consider UNDER direction picks.
                </div>
              )}
              {biasStats.avgBias < -1 && (
                <div style={{ padding: "8px 14px", background: "rgba(5,46,22,0.3)", fontSize: 11, color: "#4ade80" }}>
                  Model is under-predicting by &gt;1 disposal. OVER picks may have structural edge.
                </div>
              )}
              {Math.abs(biasStats.avgBias) <= 1 && (
                <div style={{ padding: "8px 14px", fontSize: 11, color: "#666" }}>
                  Bias within ±1 disposal — model is well-calibrated under this configuration.
                </div>
              )}
            </div>

            {/* Win rate by position */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Win Rate by Position
                </span>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "60px 50px 70px 70px 60px",
                gap: 8, padding: "8px 14px", borderBottom: "1px solid #0a0a0a",
              }}>
                {["Pos", "Picks", "Original", "Simulated", "Delta"].map(h => (
                  <span key={h} style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>
              {positionStats.map(ps => {
                const delta = ps.simRate - ps.origRate;
                return (
                  <div key={ps.pos} style={{
                    display: "grid", gridTemplateColumns: "60px 50px 70px 70px 60px",
                    gap: 8, padding: "9px 14px", borderBottom: "1px solid #0a0a0a", alignItems: "center",
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: "#f97316",
                      background: "#1a0f00", border: "1px solid #f9731630",
                      borderRadius: 4, padding: "2px 6px", textAlign: "center",
                    }}>{ps.pos}</span>
                    <span style={{ fontSize: 12, color: "#666" }}>{ps.origTotal}</span>
                    <span style={{ fontSize: 13, color: "#666" }}>{ps.origRate}%</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{ps.simRate}%</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#666" }}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)}% {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Win rate by round */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Win Rate by Round (all picks tracked)
                </span>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "60px 60px 80px 80px 70px",
                gap: 8, padding: "8px 14px", borderBottom: "1px solid #0a0a0a",
              }}>
                {["Round", "Picks", "Original", "Simulated", "Delta"].map(h => (
                  <span key={h} style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>
              {roundStats.map(rs => {
                const delta = rs.simRate - rs.origRate;
                return (
                  <div key={rs.rnd} style={{
                    display: "grid", gridTemplateColumns: "60px 60px 80px 80px 70px",
                    gap: 8, padding: "9px 14px", borderBottom: "1px solid #0a0a0a", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>Rd {rs.rnd}</span>
                    <span style={{ fontSize: 12, color: "#666" }}>{rs.totalPicks}</span>
                    <span style={{ fontSize: 13, color: "#666" }}>{rs.origRate}%</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{rs.simRate}%</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#666" }}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)}% {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"}
                    </span>
                  </div>
                );
              })}
              <div style={{ padding: "8px 14px", fontSize: 10, color: "#555" }}>
                Based on {ALL_EXTENDED.length} verified picks · {roundsLabel} · {currentSeason} season
              </div>
            </div>

            {/* Condition breakdown */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Win Rate by Condition (simulated)
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                {conditionStats.map((c, i) => (
                  <div key={c.cond} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid #111" : "none" }}>
                    <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{c.cond} ({c.count})</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c.winRate >= 55 ? "#4ade80" : c.winRate < 48 ? "#f87171" : "#f97316" }}>
                      {c.winRate}%
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 14px", borderTop: "1px solid #0a0a0a" }}>
                <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Venue Reference (historical backtesting)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 60px", gap: 4 }}>
                  {[
                    { venue: "Adelaide Oval", rate: 57.1 },
                    { venue: "GABBA", rate: 60.0 },
                    { venue: "GMHBA Stadium", rate: 55.6 },
                    { venue: "Marvel Stadium", rate: 51.9 },
                    { venue: "MCG", rate: 48.6 },
                    { venue: "Optus Stadium", rate: 42.5 },
                  ].map(v => (
                    <div key={v.venue} style={{ display: "contents" }}>
                      <span style={{ fontSize: 10, color: "#555", padding: "3px 0" }}>{v.venue}</span>
                      <span style={{ fontSize: 10, color: "#333", textAlign: "right" }}>hist</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: v.rate >= 55 ? "#4ade80" : v.rate < 48 ? "#f87171" : "#888", textAlign: "right" }}>
                        {v.rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Picks that changed outcome */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Picks with Changed Outcome or Confidence
                </span>
                <span style={{ fontSize: 10, color: "#555", marginLeft: "auto" }}>{changedPicks.length} picks</span>
              </div>
              <div style={{ padding: "8px 14px", borderBottom: "1px solid #0a0a0a", display: "flex", gap: 6 }}>
                {([
                  { key: "ALL", label: "All changes" },
                  { key: "LOSS_WIN", label: "LOSS→WIN ▲" },
                  { key: "WIN_LOSS", label: "WIN→LOSS ▼" },
                ] as const).map(opt => (
                  <button key={opt.key} onClick={() => setOutcomeFilter(opt.key)} style={{
                    padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: "pointer",
                    border: outcomeFilter === opt.key ? "1px solid #f97316" : "1px solid #111",
                    background: outcomeFilter === opt.key ? "#f97316" : "#0a0a0a",
                    color: outcomeFilter === opt.key ? "#000" : "#555",
                  }}>{opt.label}</button>
                ))}
              </div>
              {changedPicks.length === 0 ? (
                <div style={{ padding: "20px 14px", fontSize: 12, color: "#555", textAlign: "center" }}>
                  No outcome changes under this configuration.
                </div>
              ) : (
                changedPicks.map((p, i) => {
                  const isImproved = p.outcome_changed && p.new_result === "WIN";
                  const isDegraded = p.outcome_changed && p.new_result === "LOSS";
                  const rowBg = isImproved ? "rgba(34,197,94,0.05)" : isDegraded ? "rgba(239,68,68,0.05)" : "transparent";
                  return (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "1.6fr 60px 120px 120px 90px",
                      gap: 8, padding: "10px 14px", borderBottom: "1px solid #0a0a0a",
                      alignItems: "center", background: rowBg,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PlayerAvatar name={p.player} team={p.team} size={24} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f0f0" }}>{p.player}</div>
                          <div style={{ fontSize: 9, color: "#666" }}>Rd {p.round} · {p.position}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: "#666" }}>vs {p.line}</span>
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: p.original_result === "WIN" ? "#22c55e" : "#ef4444" }}>
                          {p.original_result === "WIN" ? "✓" : "✗"} {p.original_result}
                        </span>
                        <span style={{ color: "#555", margin: "0 4px" }}>·</span>
                        <span style={{ color: "#555" }}>{p.original_confidence}</span>
                      </div>
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: p.new_result === "WIN" ? "#22c55e" : "#ef4444" }}>
                          {p.new_result === "WIN" ? "✓" : "✗"} {p.new_result}
                        </span>
                        <span style={{ color: "#555", margin: "0 4px" }}>·</span>
                        <span style={{ color: p.confidence_changed ? "#f97316" : "#555" }}>{p.new_confidence}</span>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: isImproved ? "#22c55e" : isDegraded ? "#ef4444" : "#f97316",
                      }}>
                        {isImproved ? "LOSS→WIN ▲" : isDegraded ? "WIN→LOSS ▼" : "Tier change"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Top Changes summary */}
            {(changeSummary.ltwCount > 0 || changeSummary.wtlCount > 0) && (
              <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Top Changes
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ padding: "12px 14px", borderRight: "1px solid #111" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>
                      {changeSummary.ltwCount} losses → wins ▲
                    </div>
                    {changeSummary.lossToWin.map((p, i) => (
                      <div key={i} style={{ fontSize: 10, color: "#666", marginBottom: 2 }}>{p.player} (Rd {p.round})</div>
                    ))}
                    {changeSummary.ltwPattern && (
                      <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>
                        Pattern: mostly <strong style={{ color: "#888" }}>{changeSummary.ltwPattern}</strong> picks
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>
                      {changeSummary.wtlCount} wins → losses ▼
                    </div>
                    {changeSummary.winToLoss.map((p, i) => (
                      <div key={i} style={{ fontSize: 10, color: "#666", marginBottom: 2 }}>{p.player} (Rd {p.round})</div>
                    ))}
                    {changeSummary.wtlPattern && (
                      <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>
                        Pattern: mostly <strong style={{ color: "#888" }}>{changeSummary.wtlPattern}</strong> picks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Full pick-by-pick table (collapsible) */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
              <button
                onClick={() => setShowFullTable(o => !o)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "12px 14px", background: "none",
                  border: "none", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Full Pick-by-Pick Table ({simulatedPicks.length} picks)
                </span>
                <span style={{ fontSize: 10, color: "#555" }}>{showFullTable ? "▲ Collapse" : "▼ Expand"}</span>
              </button>

              {showFullTable && (
                <>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1.4fr 50px 60px 60px 60px 70px 90px 80px",
                    gap: 4, padding: "8px 14px", borderTop: "1px solid #111", borderBottom: "1px solid #111",
                  }}>
                    {["Player", "Rnd", "Line", "Actual", "Orig→New", "E/V →New", "Conf →New", "Outcome"].map(h => (
                      <span key={h} style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                    ))}
                  </div>
                  {paginatedPicks.map((p, i) => {
                    const rowBg = p.outcome_changed
                      ? p.new_result === "WIN" ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)"
                      : "transparent";
                    return (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "1.4fr 50px 60px 60px 60px 70px 90px 80px",
                        gap: 4, padding: "9px 14px", borderBottom: "1px solid #0a0a0a",
                        alignItems: "center", background: rowBg,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <PlayerAvatar name={p.player} team={p.team} size={20} />
                          <span style={{ fontSize: 11, color: "#e0e0e0" }}>{p.player}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#666" }}>{p.round}</span>
                        <span style={{ fontSize: 11, color: "#555" }}>{p.line}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{p.actual}</span>
                        <span style={{ fontSize: 10, color: "#555" }}>
                          {p.original_predicted.toFixed(1)}→<span style={{ color: "#f97316" }}>{p.new_predicted.toFixed(1)}</span>
                        </span>
                        <span style={{ fontSize: 10, color: "#555" }}>
                          {p.original_edge_vol.toFixed(2)}→<span style={{ color: "#60a5fa" }}>{p.new_edge_vol.toFixed(2)}</span>
                        </span>
                        <span style={{ fontSize: 10, color: p.confidence_changed ? "#f97316" : "#555" }}>
                          {p.original_confidence}→{p.new_confidence}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: p.new_result === "WIN" ? "#22c55e" : "#ef4444" }}>
                          {p.new_result === "WIN" ? "✓" : "✗"} {p.new_result}
                          {p.outcome_changed && <span style={{ marginLeft: 4, color: "#f97316" }}>!</span>}
                        </span>
                      </div>
                    );
                  })}
                  {simulatedPicks.length > PAGE_SIZE && (
                    <div style={{ padding: "10px 14px", display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setTablePage(p => Math.max(0, p - 1))}
                        disabled={tablePage === 0}
                        style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, cursor: "pointer",
                          border: "1px solid #111", background: "#0a0a0a",
                          color: tablePage === 0 ? "#444" : "#888",
                        }}
                      >← Prev</button>
                      <span style={{ fontSize: 10, color: "#555" }}>
                        Page {tablePage + 1} of {Math.ceil(simulatedPicks.length / PAGE_SIZE)}
                      </span>
                      <button
                        onClick={() => setTablePage(p => Math.min(Math.ceil(simulatedPicks.length / PAGE_SIZE) - 1, p + 1))}
                        disabled={(tablePage + 1) * PAGE_SIZE >= simulatedPicks.length}
                        style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, cursor: "pointer",
                          border: "1px solid #111", background: "#0a0a0a",
                          color: (tablePage + 1) * PAGE_SIZE >= simulatedPicks.length ? "#444" : "#888",
                        }}
                      >Next →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: "#1a1a1a" }}>
          Simulation uses {ALL_EXTENDED.length} verified picks · {roundsLabel} · {currentSeason} season. Not betting advice. 18+ only.
        </div>
      </div>

      <Footer />
    </div>
  );
}
