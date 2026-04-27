"use client";

const ROUNDS_TRACKED = "3–7";
const TOTAL_BETS = 71;
const WIN_RATE = "67.6%";
const WIN_LOSS = "48W · 23L";
const GROSS_PROFIT_YTD = 18760;
const NET_PROFIT_YTD = 18760;
const PROJECTED_GROSS = 90048;
const ANNUAL_FEE = 174; // $29/month × 6 months
const NET_AFTER_SUB = 89874;
const MULTIPLIER = 517;

const ROUND_PL = [
  { round: 3, profit:  8440, wins: 12, losses:  2 },
  { round: 4, profit: -2170, wins:  9, losses: 10 },
  { round: 5, profit:  2960, wins:  8, losses:  4 },
  { round: 6, profit:  2830, wins:  9, losses:  5 },
  { round: 7, profit:  6700, wins: 10, losses:  2 },
];
const MAX_PROFIT = Math.max(...ROUND_PL.map(r => Math.abs(r.profit)));

export function AnnualROIProof() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* YTD Performance */}
      <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
          YTD Performance — Rounds {ROUNDS_TRACKED}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#111", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          {[
            { label: "Total Bets",    value: `${TOTAL_BETS} (${WIN_LOSS})`,   color: "#f0f0f0" },
            { label: "Win Rate",      value: WIN_RATE,                         color: "#4ade80" },
            { label: "Gross Profit",  value: `$${GROSS_PROFIT_YTD.toLocaleString()}`, color: "#4ade80" },
            { label: "Net Profit",    value: `$${NET_PROFIT_YTD.toLocaleString()}`,   color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{ background: "#080808", padding: "16px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
        {/* P&L bar chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROUND_PL.map(r => (
            <div key={r.round} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, fontSize: 11, fontWeight: 600, color: "#555", flexShrink: 0 }}>R{r.round}</div>
              <div style={{ flex: 1, height: 26, background: "#111", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min((Math.abs(r.profit) / MAX_PROFIT) * 100, 100)}%`,
                  height: "100%",
                  background: r.profit >= 0
                    ? "linear-gradient(90deg, #f97316, #ea580c)"
                    : "linear-gradient(90deg, #ef4444, #dc2626)",
                  display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                  minWidth: 52,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>
                    {r.profit > 0 ? '+' : ''}${Math.abs(r.profit).toLocaleString()}
                  </span>
                </div>
              </div>
              <div style={{ width: 42, textAlign: "right", fontSize: 10, color: "#666", flexShrink: 0 }}>
                <span style={{ color: "#4ade80" }}>{r.wins}W</span>/<span style={{ color: "#ef4444" }}>{r.losses}L</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 12, lineHeight: 1.6 }}>
          $1,000 flat stake per bet at 1.87 avg odds. All results verified vs Wheeloratings.
        </div>
      </div>

      {/* Full Season Projection */}
      <div style={{ background: "#080808", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: "24px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Projected Full Season — 24 Rounds
        </div>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Based on 14.2 avg HC picks per round</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
            <span style={{ color: "#666" }}>Projected gross profit</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: "#f0f0f0" }}>${PROJECTED_GROSS.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "10px 12px", background: "#0d0d0d", borderRadius: 6 }}>
            <span style={{ color: "#666" }}>AFL season access ($29 × 6 months)</span>
            <span style={{ fontWeight: 700, color: "#f0f0f0" }}>−$174</span>
          </div>
          <div style={{ height: 1, background: "#1a1a1a" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#030f08", border: "1px solid #14532d", borderRadius: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#888" }}>Net profit after subscription</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.02em" }}>${NET_AFTER_SUB.toLocaleString()}</span>
          </div>
        </div>

        {/* Multiplier callout */}
        <div style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 8, padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#f97316", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {MULTIPLIER}×
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 8, lineHeight: 1.6 }}>
            Your $174 season subscription is recovered <strong style={{ color: "#f97316" }}>{MULTIPLIER} times over</strong> by year-end profits
          </div>
        </div>
      </div>

      {/* Before vs After comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Without Pro */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#888", marginBottom: 16 }}>Without Pro</div>
          {[
            { label: "HC picks access", value: "2 of 6+", bad: true },
            { label: "Simulator access", value: "Locked",  bad: true },
            { label: "Real-time results", value: "No",      bad: true },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
              <span style={{ color: "#555" }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: "#ef4444" }}>{row.value}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "#111", margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: "#666" }}>Year-end profit</span>
            <span style={{ color: "#f0f0f0" }}>$0</span>
          </div>
        </div>

        {/* With Pro */}
        <div style={{ background: "#080808", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 10, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#f97316", marginBottom: 16 }}>With Pro — $29/mo</div>
          {[
            { label: "HC picks access",   value: "All picks" },
            { label: "Simulator access",  value: "Full" },
            { label: "Real-time results", value: "Live" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
              <span style={{ color: "#555" }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: "#4ade80" }}>{row.value}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "#111", margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: "#666" }}>Year-end profit</span>
            <span style={{ fontSize: 16, color: "#4ade80" }}>${NET_AFTER_SUB.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Closing statement */}
      <div style={{ background: "#050505", border: "1px solid #111", borderRadius: 10, padding: "20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f0f0f0", marginBottom: 6 }}>The math is clear.</div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>
          A $174 season investment returns ${NET_AFTER_SUB.toLocaleString()} in profits.{" "}
          Your subscription pays for itself{" "}
          <span style={{ color: "#f97316", fontWeight: 700 }}>{MULTIPLIER} times over</span>.
        </div>
      </div>

    </div>
  );
}
