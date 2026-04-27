"use client";

import pnlData from "@/data/paywall.json";

export function FreeTierPnLCard() {
  const { roundBreakdown, projections } = pnlData;
  const totalBets   = pnlData.totalBets;
  const grossProfit = pnlData.grossProfit;
  const winRate     = pnlData.winRate;
  const totalFees   = projections.seasonFee;
  const netAfterFees = projections.netAfterFee;
  const roiBefore  = ((grossProfit / (totalBets * 1000)) * 100).toFixed(1);
  const roiAfter   = ((netAfterFees / (totalBets * 1000)) * 100).toFixed(1);
  const annualMultiple = projections.subscriptionMultiple;
  const MAX_PROFIT = Math.max(...roundBreakdown.map(r => Math.abs(r.netPL)));

  return (
    <div style={{
      width: "100%",
      background: "#0a0a0a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      padding: 24,
      marginBottom: 20,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", margin: "0 0 20px", letterSpacing: "-0.01em" }}>
        Why HC Picks Matter
      </h3>

      {/* Main stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#111", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        {[
          { label: "TOTAL BETS", value: totalBets },
          { label: "WIN RATE",   value: `${(winRate * 100).toFixed(1)}%` },
          { label: "GROSS PROFIT", value: `$${grossProfit.toLocaleString()}`, color: "#4ade80" },
          { label: "ROI",          value: `${roiBefore}%`, color: "#4ade80" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#080808", padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: (s as { color?: string }).color ?? "#f0f0f0", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Fee impact section */}
      <div style={{
        background: "#080808",
        border: "1px solid #1a1a1a",
        borderRadius: 8,
        padding: "18px 20px",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          Subscription Impact
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #111" }}>
          <span style={{ fontSize: 13, color: "#666" }}>
            {projections.seasonMonths}-month season access
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>
            ${totalFees} total fees
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Before fees
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
              Net: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>${grossProfit.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              ROI: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>{roiBefore}%</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              After ${projections.monthlyFee}/mo
            </div>
            <div style={{ fontSize: 13, color: "#4ade80", marginBottom: 4 }}>
              Net: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>${netAfterFees.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 13, color: "#4ade80" }}>
              ROI: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>{roiAfter}%</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #111", fontSize: 11, color: "#555", lineHeight: 1.6 }}>
          <span style={{ color: "#f97316", fontWeight: 600 }}>{annualMultiple}× multiplier: </span>
          The subscription pays for itself {annualMultiple}× over in annual profit.
        </div>
      </div>

      {/* P&L by round - horizontal bar chart */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          P&amp;L by Round (3 to 7)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roundBreakdown.map(r => {
            const isNeg = r.netPL < 0;
            const barWidth = `${Math.min((Math.abs(r.netPL) / MAX_PROFIT) * 100, 100)}%`;
            return (
              <div key={r.round} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: "#888", flexShrink: 0 }}>
                  Round {r.round}
                </div>
                <div style={{ flex: 1, height: 32, background: "#111", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: barWidth,
                    height: "100%",
                    background: isNeg
                      ? "linear-gradient(90deg, #ef4444, #dc2626)"
                      : "linear-gradient(90deg, #f97316, #ea580c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 10,
                    minWidth: 60,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                      {r.netPL > 0 ? "+" : ""}${Math.abs(r.netPL).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div style={{ width: 64, textAlign: "right", fontSize: 11, color: "#666", flexShrink: 0 }}>
                  <span style={{ color: "#4ade80" }}>{r.wins}W</span>
                  {" / "}
                  <span style={{ color: "#ef4444" }}>{r.losses}L</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
