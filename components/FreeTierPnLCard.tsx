"use client";

import { useMemo } from "react";
import { calculateROI } from "@/lib/calculations";
import pnlData from "@/data/paywall.json";

export function FreeTierPnLCard() {
  const roi = useMemo(() => calculateROI(pnlData.hcStats), []);
  const annualMultiple = Math.round(roi.grossProfit / (pnlData.hcStats.monthlySubscriptionFee * 12));
  const MAX_PROFIT = Math.max(...pnlData.roundBreakdown.map(r => r.netProfit));

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
          { label: "TOTAL BETS", value: pnlData.hcStats.totalBets },
          { label: "WIN RATE", value: `${(pnlData.hcStats.winRate * 100).toFixed(1)}%` },
          { label: "GROSS PROFIT", value: `$${roi.grossProfit.toLocaleString()}`, color: "#4ade80" },
          { label: "ROI", value: `${roi.roiBefore.toFixed(1)}%`, color: "#4ade80" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#080808", padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color ?? "#f0f0f0", letterSpacing: "-0.02em" }}>
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
            {pnlData.hcStats.durationMonths}-month sample period
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>
            ${pnlData.hcStats.durationMonths * pnlData.hcStats.monthlySubscriptionFee} total fees
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Before fees
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
              Net: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>${roi.grossProfit.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              ROI: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>{roi.roiBefore.toFixed(1)}%</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              After $29/mo
            </div>
            <div style={{ fontSize: 13, color: "#4ade80", marginBottom: 4 }}>
              Net: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>${roi.netProfit.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 13, color: "#4ade80" }}>
              ROI: <span style={{ color: "#f0f0f0", fontWeight: 700 }}>{roi.roiAfter.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #111", fontSize: 11, color: "#555", lineHeight: 1.6 }}>
          <span style={{ color: "#f97316", fontWeight: 600 }}>40× multiplier: </span>
          The subscription pays for itself {annualMultiple}× over in annual profit.
        </div>
      </div>

      {/* P&L by round — horizontal bar chart */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          P&L by Round (3–6)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pnlData.roundBreakdown.map(r => {
            const barWidth = `${Math.min((r.netProfit / MAX_PROFIT) * 100, 100)}%`;
            return (
              <div key={r.round} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: "#888", flexShrink: 0 }}>
                  Round {r.round}
                </div>
                <div style={{ flex: 1, height: 32, background: "#111", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: barWidth,
                    height: "100%",
                    background: "linear-gradient(90deg, #f97316, #ea580c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 10,
                    minWidth: 60,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                      ${r.netProfit.toLocaleString()}
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
