"use client";

import paywallData from "@/data/paywall.json";

const PNL_DATA = paywallData.historicalPnL;
const HC_STATS = paywallData.hcStats;
const MAX_PROFIT = Math.max(...PNL_DATA.map(r => r.netProfit));
const CHART_HEIGHT = 120;
const SUB_COST_ANNUAL = 29 * 12;

export function FreeTierPnLCard() {
  const annualProfit = HC_STATS.netProfit * (52 / 4) - SUB_COST_ANNUAL;
  const roiPct = (HC_STATS.roi * 100).toFixed(1);
  const costMultiple = Math.round(HC_STATS.netProfit / SUB_COST_ANNUAL);

  return (
    <div style={{
      background: "#050505",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      padding: "24px",
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
          Why HC Picks Matter
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" }}>
          Historical performance tracking
        </div>
      </div>

      {/* Main stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#111", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        {[
          { label: "Total HC Bets", value: HC_STATS.totalBets },
          { label: "Win Rate", value: `${(HC_STATS.winRate * 100).toFixed(1)}%` },
          { label: "ROI", value: `${roiPct}%` },
          { label: "Gross Profit", value: `$${HC_STATS.netProfit.toLocaleString()}` },
        ].map((s, i) => (
          <div key={i} style={{ background: "#080808", padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub fee impact */}
      <div style={{
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 8,
        padding: "14px 16px",
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 6 }}>
          After ${SUB_COST_ANNUAL}/year subscription cost:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Annual profit (extrapolated)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.02em" }}>
              ${annualProfit.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Subscription ROI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.02em" }}>
              {costMultiple}× cost
            </div>
            <div style={{ fontSize: 10, color: "#555" }}>profit vs ${SUB_COST_ANNUAL} fee</div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Running P&L by Round (HC picks only)
        </div>

        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: CHART_HEIGHT + 28,
          paddingBottom: 0,
          position: "relative",
        }}>
          {/* Y-axis guide lines */}
          {[0.25, 0.5, 0.75, 1].map(frac => (
            <div key={frac} style={{
              position: "absolute",
              left: 0, right: 0,
              bottom: 20 + (CHART_HEIGHT * frac),
              borderTop: "1px solid #111",
              zIndex: 0,
            }} />
          ))}

          {PNL_DATA.map((d, i) => {
            const barH = Math.max(6, (d.netProfit / MAX_PROFIT) * CHART_HEIGHT);
            const isLast = i === PNL_DATA.length - 1;
            return (
              <div key={d.round} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "flex-end",
                height: "100%", position: "relative", zIndex: 1,
              }}>
                {/* Value label */}
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  color: isLast ? "#888" : "#f97316",
                  marginBottom: 4, whiteSpace: "nowrap",
                }}>
                  +${(d.netProfit / 1000).toFixed(1)}k
                  {isLast && <span style={{ color: "#666" }}> est.</span>}
                </div>
                {/* Bar */}
                <div style={{
                  width: "100%",
                  height: barH,
                  background: isLast
                    ? "repeating-linear-gradient(45deg, #f97316, #f97316 2px, transparent 2px, transparent 6px)"
                    : "linear-gradient(180deg, #fb923c 0%, #f97316 100%)",
                  borderRadius: "3px 3px 0 0",
                  border: isLast ? "1px solid #f9731660" : "none",
                  opacity: isLast ? 0.7 : 1,
                }} />
                {/* Round label */}
                <div style={{ fontSize: 10, color: "#666", marginTop: 6, fontWeight: 600 }}>
                  R{d.round}
                </div>
                {/* Bet count */}
                <div style={{ fontSize: 9, color: "#444" }}>
                  {d.wins}/{d.bets}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
          R7 estimated from 2 HC picks · $1,000 stake · 1.87 avg odds assumed
        </div>
      </div>

      <div style={{ paddingTop: 12, borderTop: "1px solid #0d0d0d", fontSize: 10, color: "#444", lineHeight: 1.6 }}>
        Tracking ${HC_STATS.totalStaked.toLocaleString()} staked across Rounds 3–6 · Extrapolated figures assume similar round cadence.
        Not financial advice. 18+ only.
      </div>
    </div>
  );
}
