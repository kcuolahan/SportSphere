"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

const ROUND_DATA = [
  { round: 3,  picks: 14, wins: 12, losses: 2,  winRate: 85.7, netPL:  8440, bankroll:  9440 },
  { round: 4,  picks: 19, wins: 9,  losses: 10, winRate: 47.4, netPL: -2170, bankroll:  7270 },
  { round: 5,  picks: 12, wins: 8,  losses: 4,  winRate: 66.7, netPL:  2960, bankroll: 10230 },
  { round: 6,  picks: 14, wins: 9,  losses: 5,  winRate: 64.3, netPL:  2830, bankroll: 13060 },
  { round: 7,  picks: 12, wins: 10, losses: 2,  winRate: 83.3, netPL:  6700, bankroll: 19760 },
];

const POSITION_DATA = [
  { position: "MID",  picks: 44, wins: 30, losses: 14, winRate: 68.2 },
  { position: "DEF",  picks: 23, wins: 15, losses: 8,  winRate: 65.2 },
  { position: "RUCK", picks: 4,  wins: 3,  losses: 1,  winRate: 75.0 },
];

function winRateColor(wr: number) {
  if (wr >= 65) return "#4ade80";
  if (wr >= 50) return "#f97316";
  return "#ef4444";
}

export default function AccuracyPage() {
  const { isPro, loading: authLoading } = useProAccess();

  if (authLoading) return <div style={{ minHeight: "100vh", background: "#000" }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Verified Track Record - HC Filtered Picks Only
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Public Track Record
          </h1>
          <p style={{ fontSize: 14, color: "#777", maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
            Every HIGH CONVICTION pick logged. Every result verified against official AFL game data.
            No cherry picking. No hidden losses. This is the only tier we publish and market.
          </p>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "HC Win Rate",   value: "67.6%",      sub: "48W / 23L",        color: "#4ade80" },
            { label: "Total HC Picks", value: "71",         sub: "R3 to R7 · 2026",  color: "#f0f0f0" },
            { label: "Gross P&L",     value: "+$18,760",   sub: "$1k flat stake",    color: "#4ade80" },
            { label: "ROI",           value: "26.4%",      sub: "1.87 avg odds",     color: "#f97316" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* What this shows */}
        <div style={{ background: "#080808", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 10, padding: "20px 24px", marginBottom: 36, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 18, color: "#f97316", flexShrink: 0, lineHeight: 1 }}>ℹ</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", marginBottom: 6 }}>What this track record shows</div>
            <p style={{ fontSize: 13, color: "#777", margin: 0, lineHeight: 1.7 }}>
              These results cover only our HIGH CONVICTION (HC) filtered picks - the tier published to subscribers each week.
              HC picks require both STRONG model confidence AND Edge/Vol ≥ 0.50. The full model generates ~150 predictions
              per round across all tiers; we publish and track only the HC filtered subset. This is the most transparent way
              to show real-world performance of the picks we actually recommend.
            </p>
          </div>
        </div>

        {/* Round by round table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>Round by Round</h2>
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr style={{ background: "#050505" }}>
                    {["Round", "Picks", "W", "L", "Win Rate", "Net P&L", "Bankroll"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROUND_DATA.map((row, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #0d0d0d" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#fff" }}>R{row.round}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{row.picks}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{row.wins}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{row.losses}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: winRateColor(row.winRate) }}>{row.winRate}%</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: row.netPL >= 0 ? "#4ade80" : "#ef4444" }}>
                        {row.netPL >= 0 ? "+" : ""}${row.netPL.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>
                        ${row.bankroll.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ borderTop: "2px solid rgba(249,115,22,0.3)", background: "#050505" }}>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#f97316" }}>TOTAL</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>71</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#4ade80" }}>48</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#ef4444" }}>23</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#4ade80" }}>67.6%</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#4ade80" }}>+$18,760</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#f0f0f0" }}>$19,760</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "#444", marginTop: 10, lineHeight: 1.6 }}>
            R4 shows a losing round - included for full transparency.
            $1,000 flat stake assumed. 1.87 average odds.
          </p>
        </section>

        {/* Position breakdown - Pro gate */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>By Position</h2>

          {isPro ? (
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#050505" }}>
                    {["Position", "Picks", "W", "L", "Win Rate"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POSITION_DATA.map((row, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #0d0d0d" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#f97316" }}>{row.position}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{row.picks}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{row.wins}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{row.losses}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: winRateColor(row.winRate) }}>{row.winRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden", filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {POSITION_DATA.map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #0d0d0d" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>████</td>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>██</td>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>██</td>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>██</td>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>████</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", background: "rgba(0,0,0,0.85)", borderRadius: 10, padding: "24px 32px", border: "1px solid #1a1a1a" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", marginBottom: 6 }}>Position breakdown - Pro only</div>
                  <p style={{ fontSize: 12, color: "#555", margin: "0 0 16px", lineHeight: 1.6 }}>Win rates by MID, DEF and RUCK position</p>
                  <Link href="/auth/payment" style={{ display: "inline-block", background: "#f97316", color: "#000", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 6, textDecoration: "none" }}>
                    Unlock Pro - $29/month
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Methodology */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Methodology</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "All picks generated by the SportSphere six-factor weighted model",
                "Only STRONG confidence tier picks with Edge/Vol ≥ 0.50 are published",
                "Results verified against official AFL game data (Wheeloratings)",
                "$1,000 flat stake assumed per pick at 1.87 average decimal odds",
                "Win = actual disposals meet or exceed the line in the predicted direction",
                "Loss = actual disposals miss the line in the predicted direction",
                "No picks excluded retrospectively - all results published including losses",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: "#666", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#333", flexShrink: 0 }}>•</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p style={{ fontSize: 11, color: "#444", textAlign: "center", lineHeight: 1.7 }}>
          Past performance does not guarantee future results.
          Analytics only - not financial or betting advice. 18+ only.
          Please gamble responsibly. Call{" "}
          <a href="tel:1800858858" style={{ color: "#555" }}>1800 858 858</a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}
