"use client";

import { useState } from "react";

type Signal = "🔥 HIGH CONVICTION" | "✅ BET" | "❌ SKIP" | "⛔ FWD NO BET";
type Direction = "OVER ⬆" | "UNDER ⬇";
type Confidence = "🔥 STRONG" | "⚠ MODERATE" | "LEAN";
type VolTier = "LOW" | "MODERATE" | "HIGH" | "V.HIGH";

interface Prediction {
  player: string;
  position: string;
  team: string;
  opponent: string;
  venue: string;
  bookie_line: number;
  predicted: number;
  edge: number;
  direction: Direction;
  confidence: Confidence;
  condition: string;
  edge_vol: number;
  enhanced_signal: Signal;
  bet_score: number;
  filter_pass: boolean;
  std_dev: number;
  volatility_tier: VolTier;
  play_style: string;
}

const PREDICTIONS: Prediction[] = [
  {
    player: "Brodie Grundy",
    position: "RUCK",
    team: "SYD",
    opponent: "GWS",
    venue: "SCG",
    bookie_line: 21.5,
    predicted: 16.0,
    edge: -5.5,
    direction: "UNDER ⬇",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 1.149,
    enhanced_signal: "🔥 HIGH CONVICTION",
    bet_score: 1.149,
    filter_pass: true,
    std_dev: 4.8,
    volatility_tier: "MODERATE",
    play_style: "HYBRID",
  },
  {
    player: "Lachie Ash",
    position: "DEF",
    team: "GWS",
    opponent: "SYD",
    venue: "SCG",
    bookie_line: 27.5,
    predicted: 31.3,
    edge: 3.8,
    direction: "OVER ⬆",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 1.115,
    enhanced_signal: "🔥 HIGH CONVICTION",
    bet_score: 1.115,
    filter_pass: true,
    std_dev: 3.4,
    volatility_tier: "LOW",
    play_style: "TRANS",
  },
  {
    player: "Lachie Whitfield",
    position: "DEF",
    team: "GWS",
    opponent: "SYD",
    venue: "SCG",
    bookie_line: 27.5,
    predicted: 31.1,
    edge: 3.6,
    direction: "OVER ⬆",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 0.988,
    enhanced_signal: "🔥 HIGH CONVICTION",
    bet_score: 0.988,
    filter_pass: true,
    std_dev: 3.6,
    volatility_tier: "LOW",
    play_style: "TRANS",
  },
  {
    player: "Angus Sheldrick",
    position: "MID",
    team: "SYD",
    opponent: "GWS",
    venue: "SCG",
    bookie_line: 23.5,
    predicted: 18.8,
    edge: -4.7,
    direction: "UNDER ⬇",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 0.944,
    enhanced_signal: "✅ BET",
    bet_score: 0.944,
    filter_pass: true,
    std_dev: 4.98,
    volatility_tier: "MODERATE",
    play_style: "STOP",
  },
  {
    player: "Nick Daicos",
    position: "MID",
    team: "COL",
    opponent: "CAR",
    venue: "MCG",
    bookie_line: 30.5,
    predicted: 35.1,
    edge: 4.6,
    direction: "OVER ⬆",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 0.803,
    enhanced_signal: "✅ BET",
    bet_score: 0.803,
    filter_pass: true,
    std_dev: 5.73,
    volatility_tier: "MODERATE",
    play_style: "TRANS",
  },
  {
    player: "Scott Pendlebury",
    position: "MID",
    team: "COL",
    opponent: "CAR",
    venue: "MCG",
    bookie_line: 21.5,
    predicted: 16.7,
    edge: -4.8,
    direction: "UNDER ⬇",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 0.829,
    enhanced_signal: "✅ BET",
    bet_score: 0.829,
    filter_pass: true,
    std_dev: 5.79,
    volatility_tier: "MODERATE",
    play_style: "STOP",
  },
  {
    player: "Bailey Smith",
    position: "MID",
    team: "GEE",
    opponent: "WBD",
    venue: "GMHBA",
    bookie_line: 31.5,
    predicted: 35.0,
    edge: 3.5,
    direction: "OVER ⬆",
    confidence: "🔥 STRONG",
    condition: "Dry",
    edge_vol: 0.62,
    enhanced_signal: "✅ BET",
    bet_score: 0.62,
    filter_pass: true,
    std_dev: 5.65,
    volatility_tier: "MODERATE",
    play_style: "TRANS",
  },
  {
    player: "Sam Walsh",
    position: "MID",
    team: "CAR",
    opponent: "COL",
    venue: "MCG",
    bookie_line: 29.5,
    predicted: 28.2,
    edge: -1.3,
    direction: "UNDER ⬇",
    confidence: "LEAN",
    condition: "Dry",
    edge_vol: 0.22,
    enhanced_signal: "❌ SKIP",
    bet_score: 0.22,
    filter_pass: false,
    std_dev: 5.9,
    volatility_tier: "MODERATE",
    play_style: "STOP",
  },
];

type FilterType = "ALL" | "ACTIONABLE" | "HC";

export default function SportSpherePage() {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filtered = PREDICTIONS.filter((p) => {
    if (filter === "ACTIONABLE") return p.filter_pass;
    if (filter === "HC") return p.enhanced_signal === "🔥 HIGH CONVICTION";
    return true;
  });

  const hcCount = PREDICTIONS.filter(
    (p) => p.enhanced_signal === "🔥 HIGH CONVICTION"
  ).length;
  const betCount = PREDICTIONS.filter((p) => p.filter_pass).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "#111111",
        borderBottom: "1px solid #1f1f1f",
        padding: "0 20px",
      }}>
        <div style={{
          maxWidth: 800,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #c2410c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}>S</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
                Sport<span style={{ color: "#f97316" }}>Sphere</span>
              </div>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                AFL Disposal Intelligence
              </div>
            </div>
          </div>

          {/* Round badge */}
          <div style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "6px 14px",
            textAlign: "right",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f97316" }}>Round 6</div>
            <div style={{ fontSize: 10, color: "#555" }}>2026 Season</div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: 10,
            padding: "14px 16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{PREDICTIONS.length}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Picks</div>
          </div>

          <div style={{
            background: "#1a0f00",
            border: "1px solid #f9731640",
            borderRadius: 10,
            padding: "14px 16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#f97316" }}>{hcCount}</div>
            <div style={{ fontSize: 11, color: "#f9731680", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>High Conviction</div>
          </div>

          <div style={{
            background: "#0a1a0a",
            border: "1px solid #22c55e40",
            borderRadius: 10,
            padding: "14px 16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{betCount}</div>
            <div style={{ fontSize: 11, color: "#22c55e80", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actionable Bets</div>
          </div>
        </div>

        {/* ── ACCURACY BANNER ── */}
        <div style={{
          background: "#0f1a2a",
          border: "1px solid #1e3a5f",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa" }}>Model Track Record — Rounds 3–5</div>
            <div style={{ fontSize: 11, color: "#3b5a7a", marginTop: 2 }}>Based on 68 filtered picks · Edge/Vol ≥ 0.50</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#22c55e" }}>58.8%</div>
            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filtered Win Rate</div>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["ALL", "ACTIONABLE", "HC"] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: filter === tab ? "1px solid #f97316" : "1px solid #222",
                background: filter === tab ? "#f97316" : "#111",
                color: filter === tab ? "#fff" : "#666",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {tab === "HC" ? "🔥 High Conviction" : tab === "ACTIONABLE" ? "✅ Bets Only" : "All Picks"}
            </button>
          ))}
        </div>

        {/* ── PREDICTION CARDS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((pred) => {
            const isHC = pred.enhanced_signal === "🔥 HIGH CONVICTION";
            const isBet = pred.enhanced_signal === "✅ BET";
            const isOver = pred.direction.includes("OVER");

            const cardBorder = isHC
              ? "1px solid #f9731660"
              : isBet
              ? "1px solid #22c55e40"
              : "1px solid #1a1a1a";

            const cardBg = isHC
              ? "#130a00"
              : isBet
              ? "#0a110a"
              : "#0f0f0f";

            const signalBg = isHC
              ? "#f9731620"
              : isBet
              ? "#22c55e20"
              : "#1a1a1a";

            const signalColor = isHC
              ? "#f97316"
              : isBet
              ? "#22c55e"
              : "#444";

            const signalBorder = isHC
              ? "1px solid #f9731650"
              : isBet
              ? "1px solid #22c55e50"
              : "1px solid #222";

            return (
              <div
                key={pred.player}
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: 12,
                  padding: "16px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Orange left accent bar for HC */}
                {isHC && (
                  <div style={{
                    position: "absolute",
                    left: 0, top: 0, bottom: 0,
                    width: 3,
                    background: "#f97316",
                    borderRadius: "12px 0 0 12px",
                  }} />
                )}

                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingLeft: isHC ? 8 : 0 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                      {pred.player}
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {pred.team} vs {pred.opponent} · {pred.position} · {pred.venue}
                    </div>
                    <div style={{ fontSize: 11, color: "#3a3a3a", marginTop: 2 }}>
                      {pred.condition} · {pred.play_style} · Vol: {pred.volatility_tier}
                    </div>
                  </div>
                  <div style={{
                    background: signalBg,
                    border: signalBorder,
                    color: signalColor,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 6,
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}>
                    {pred.enhanced_signal}
                  </div>
                </div>

                {/* Numbers row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 8,
                  paddingLeft: isHC ? 8 : 0,
                }}>
                  {[
                    { label: "Bookie", value: pred.bookie_line, color: "#f0f0f0" },
                    { label: "Model", value: pred.predicted, color: "#f97316" },
                    { label: "Edge", value: (pred.edge > 0 ? "+" : "") + pred.edge, color: pred.edge > 0 ? "#22c55e" : "#ef4444" },
                    { label: "E/V Score", value: pred.bet_score.toFixed(2), color: "#60a5fa" },
                  ].map((item) => (
                    <div key={item.label} style={{
                      background: "#0a0a0a",
                      border: "1px solid #1a1a1a",
                      borderRadius: 8,
                      padding: "10px 8px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 10, color: "#444", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direction row */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                  paddingLeft: isHC ? 8 : 0,
                }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isOver ? "#22c55e" : "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    {pred.direction}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: "#333",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    {pred.confidence}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid #1a1a1a",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: "#333", lineHeight: 1.7 }}>
            SportSphere provides analytics only · Not financial advice<br />
            Edge/Vol ≥ 0.50 filter applied · FWDs excluded from bet recommendations<br />
            <span style={{ color: "#f97316" }}>sportsphere.au</span>
          </div>
        </div>

      </div>
    </div>
  );
}
