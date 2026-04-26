"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import results from "@/data/results.json";
import teamStyleData from "@/data/team-style.json";
import { totalPicks, strongRate, filteredRate, roundsLabel, currentSeason } from "@/lib/siteData";
import { useProAccess } from "@/lib/auth";

const analytics = (results as any).analytics;
const teams = teamStyleData.teams;

const POSITIONS = ["MID", "DEF", "FWD", "RUCK"] as const;
const CONDITIONS = ["Dry", "Wet", "Roof"] as const;

function getCellStyle(winRate: number, excluded: boolean): { bg: string; color: string } {
  if (excluded) return { bg: "#0a0a0a", color: "#444" };
  if (winRate >= 60) return { bg: "#052e16", color: "#4ade80" };
  if (winRate >= 55) return { bg: "#14532d", color: "#86efac" };
  if (winRate >= 50) return { bg: "#0a0a0a", color: "#888" };
  if (winRate >= 45) return { bg: "#450a0a", color: "#f87171" };
  return { bg: "#3b0000", color: "#ef4444" };
}

function SectionBadge({ n }: { n: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 24, height: 24, borderRadius: "50%",
      background: "#f97316", color: "#000",
      fontSize: 12, fontWeight: 800, flexShrink: 0,
    }}>{n}</span>
  );
}

export default function InsightsPage() {
  const { isPro, loading } = useProAccess();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isPro) router.replace("/auth/payment");
  }, [isPro, loading, router]);

  const { model_bias, by_condition, by_position_condition, by_confidence_condition } = analytics;

  const getPosCond = (pos: string, cond: string) =>
    by_position_condition.find((r: any) => r.position === pos && r.condition === cond);

  const teamStyleRows = [...teams].sort((a, b) => a.disposal_index - b.disposal_index);

  if (loading || !isPro) return null;

  function getStyle(idx: number): { label: string; color: string; meaning: string } {
    if (idx <= -21) return { label: "TRANS", color: "#60a5fa", meaning: "Facing this team favours OVER — more open play disposals" };
    if (idx >= 21)  return { label: "STOP",  color: "#f97316", meaning: "Facing this team restricts disposals — UNDER edge applies" };
    return           { label: "BAL",   color: "#888",    meaning: "Standard model prediction applies" };
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 60, minHeight: "100vh", background: "#000" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              DATA INTELLIGENCE
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f0f0", margin: 0, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Model Insights
            </h1>
            <p style={{ fontSize: 15, color: "#777", margin: 0, maxWidth: 600, lineHeight: 1.7 }}>
              Performance breakdowns from {totalPicks} backtested picks. Understand when the model fires and when to exercise caution.
            </p>
          </div>

          {/* ── SECTION 1: Team Style Impact ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <SectionBadge n={1} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Team Style Impact</h2>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20, marginLeft: 36, lineHeight: 1.6 }}>
              TRANS teams generate more open play disposals — their players tend to run more and accumulate more kicks.
              STOP teams favour contested ball — fewer disposals but more tackles.
              When a TRANS player faces a STOP team&apos;s defence, the model gets a double signal.
            </p>

            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 1fr", gap: 0, borderBottom: "1px solid #1a1a1a", padding: "8px 16px" }}>
                {["Team", "Style", "Index", "Prediction impact"].map(h => (
                  <div key={h} style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</div>
                ))}
              </div>

              {teamStyleRows.map((t, i) => {
                const style = getStyle(t.disposal_index);
                return (
                  <div
                    key={t.code}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 80px 90px 1fr",
                      padding: "10px 16px", alignItems: "center",
                      borderBottom: i < teamStyleRows.length - 1 ? "1px solid #0d0d0d" : "none",
                      background: style.label === "TRANS" ? "rgba(96,165,250,0.03)" : style.label === "STOP" ? "rgba(249,115,22,0.03)" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>{t.name}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: style.color,
                      background: style.color + "18", border: `1px solid ${style.color}30`,
                      padding: "2px 6px", borderRadius: 4, letterSpacing: "0.06em",
                      display: "inline-block",
                    }}>{style.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: style.color }}>
                      {t.disposal_index > 0 ? "+" : ""}{t.disposal_index}
                    </span>
                    <span style={{ fontSize: 11, color: "#555", lineHeight: 1.4 }}>{style.meaning}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { label: "TRANS", color: "#60a5fa", desc: "Open play · more disposals" },
                { label: "BAL",   color: "#888",    desc: "Balanced · standard prediction" },
                { label: "STOP",  color: "#f97316", desc: "Contested ball · fewer disposals" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: s.color + "18", border: `1px solid ${s.color}30`, padding: "1px 6px", borderRadius: 3 }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: "#555" }}>{s.desc}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#080808", border: "1px solid #f97316", borderRadius: 8, padding: "14px 16px" }}>
              <span style={{ fontSize: 12, color: "#999" }}>
                <strong style={{ color: "#f97316" }}>How to apply:</strong>{" "}
                Check the opponent&apos;s style on the DvP page before placing. A MID pick facing a TRANS team is a double tailwind —
                the player generates disposals AND the opponent creates more turnovers to run off.
                Disposal Index: negative = TRANS (kick chains), positive = STOP (stoppages).
              </span>
            </div>
          </section>

          {/* ── SECTION 2: Condition Performance ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <SectionBadge n={2} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Condition Performance</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {by_condition.map((c: any) => {
                const isWet = c.condition === "Wet";
                const rateColor = c.win_rate >= 55 ? "#4ade80" : c.win_rate < 48 ? "#f87171" : "#f97316";
                return (
                  <div key={c.condition} style={{
                    background: "#080808", border: `1px solid ${isWet ? "#854d0e" : "#111"}`,
                    borderRadius: 10, padding: "20px 20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>{c.condition}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{c.count} picks</div>
                      </div>
                      {isWet && (
                        <span style={{ fontSize: 9, background: "#451a03", color: "#fb923c", padding: "2px 6px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.06em" }}>
                          SMALL SAMPLE
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: rateColor, lineHeight: 1 }}>{c.win_rate}%</div>
                      <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>All picks win rate</div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{c.bet_win_rate}%</div>
                        <div style={{ fontSize: 10, color: "#555" }}>Filtered picks</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{c.mae}</div>
                        <div style={{ fontSize: 10, color: "#555" }}>MAE (disp)</div>
                      </div>
                    </div>
                    {isWet && (
                      <div style={{ marginTop: 14, padding: "8px 10px", background: "#1c0a00", borderRadius: 6, fontSize: 11, color: "#888" }}>
                        ⚠ MODERATE confidence picks hit only 16.7% in wet conditions. Avoid unless STRONG signal.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 3: Position × Condition Heatmap ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <SectionBadge n={3} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Position × Condition Heatmap</h2>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Position</th>
                    {CONDITIONS.map(c => (
                      <th key={c} style={{ padding: "10px 14px", textAlign: "center", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POSITIONS.map(pos => (
                    <tr key={pos} style={{ borderBottom: "1px solid #0d0d0d" }}>
                      <td style={{ padding: "14px 14px", color: "#f0f0f0", fontWeight: 700, fontSize: 13 }}>{pos}</td>
                      {CONDITIONS.map(cond => {
                        const cell = getPosCond(pos, cond);
                        const excluded = cell?.excluded ?? false;
                        const small = cell?.small_sample ?? false;
                        const wr = cell?.win_rate ?? 0;
                        const { bg, color } = getCellStyle(wr, excluded);
                        return (
                          <td key={cond} style={{ padding: "14px 14px", textAlign: "center", background: bg }}>
                            {cell ? (
                              <div>
                                <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{wr}%</div>
                                <div style={{ fontSize: 10, color: excluded ? "#333" : "#444", marginTop: 3 }}>{cell.count} picks</div>
                                {excluded && (
                                  <div style={{ fontSize: 9, color: "#444", marginTop: 3, fontWeight: 600, letterSpacing: "0.06em" }}>EXCL</div>
                                )}
                                {small && (
                                  <div style={{ fontSize: 9, color: "#555", marginTop: 3 }}>low n</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "#333" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { bg: "#052e16", color: "#4ade80", label: "≥60%" },
                { bg: "#14532d", color: "#86efac", label: "55–60%" },
                { bg: "#0a0a0a", color: "#888", label: "50–55%" },
                { bg: "#450a0a", color: "#f87171", label: "45–50%" },
                { bg: "#3b0000", color: "#ef4444", label: "<45%" },
                { bg: "#0a0a0a", color: "#444", label: "Excluded" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: s.bg, border: "1px solid #222" }} />
                  <span style={{ fontSize: 11, color: "#555" }}>{s.label}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#555", marginTop: 12 }}>
              FWD picks are excluded from filtered recommendations due to higher variance. RUCK/Wet and RUCK/Roof have insufficient sample sizes to draw conclusions.
            </p>
          </section>

          {/* ── SECTION 4: Model Bias ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <SectionBadge n={4} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Model Bias</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: "24px" }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Prediction Bias (avg disposals)</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#777" }}>Current model</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#f97316" }}>+{model_bias.current}</span>
                  </div>
                  <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(model_bias.current / 2) * 100}%`, background: "#f97316", borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#777" }}>Optimised model</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>+{model_bias.optimised}</span>
                  </div>
                  <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(model_bias.optimised / 2) * 100}%`, background: "#22c55e", borderRadius: 3 }} />
                  </div>
                </div>
              </div>

              <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: "24px" }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Structural Edge</div>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: 0, marginBottom: 12 }}>
                  The model historically over-predicts by <strong style={{ color: "#f97316" }}>+0.78 disposals</strong> on average. This creates a systematic UNDER edge — predictions are systematically set slightly high.
                </p>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: 0 }}>
                  The optimised configuration reduces this to <strong style={{ color: "#22c55e" }}>+0.09</strong>, near-perfect calibration. Use the Simulator to test optimised weights against historical picks.
                </p>
              </div>
            </div>
          </section>

          {/* ── SECTION 5: When to Act ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <SectionBadge n={5} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>When to Act</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {/* Best conditions */}
              <div style={{ background: "#030f08", border: "1px solid #14532d", borderRadius: 10, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", marginBottom: 14 }}>✅ Best Conditions</div>
                {[
                  "STRONG or MODERATE confidence",
                  "Adelaide Oval venue",
                  "Dry or Roof conditions",
                  "MID or DEF position",
                  "Edge/Vol ≥ 0.50",
                ].map(item => (
                  <div key={item} style={{ fontSize: 13, color: "#777", padding: "6px 0", borderBottom: "1px solid #0d1f12" }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Exercise caution */}
              <div style={{ background: "#0c0700", border: "1px solid #78350f", borderRadius: 10, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fb923c", marginBottom: 14 }}>⚠ Exercise Caution</div>
                {[
                  "MCG venue picks",
                  "LEAN confidence signals",
                  "Wet weather (check forecast)",
                  "FWD position (higher variance)",
                  "RUCK with small opponent sample",
                ].map(item => (
                  <div key={item} style={{ fontSize: 13, color: "#777", padding: "6px 0", borderBottom: "1px solid #1c1200" }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Avoid */}
              <div style={{ background: "#0f0303", border: "1px solid #7f1d1d", borderRadius: 10, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 14 }}>❌ Avoid</div>
                {[
                  "Optus Stadium venue",
                  "MODERATE signal + wet conditions",
                  "LEAN confidence + any conditions",
                  "FWD position (excluded from model)",
                  "RUCK with Wet/Roof (n < 5)",
                ].map(item => (
                  <div key={item} style={{ fontSize: 13, color: "#777", padding: "6px 0", borderBottom: "1px solid #1a0505" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 6: Key Data Findings ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <SectionBadge n={6} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Key Data Findings</h2>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20, marginLeft: 36, lineHeight: 1.6 }}>
              The five most actionable findings from {totalPicks} picks across {roundsLabel}.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {[
                {
                  stat: `${strongRate}%`,
                  label: "Raise Your E/V Threshold",
                  detail: `HC picks (E/V ≥ 0.90) hit ${strongRate}% vs ${filteredRate}% for all filtered picks. Every 0.1 increase in your threshold cuts noise and improves hit rate. When in doubt, filter up — not down.`,
                  color: "#f97316",
                  border: "#f9731620",
                },
                {
                  stat: "+5pp",
                  label: "MID vs DEF Performance Gap",
                  detail: "MID picks in dry conditions outperform DEF picks by approximately 5 percentage points. DEF disposals carry more variance from opposition pressure and contest rates. Favour MID when both are available.",
                  color: "#4ade80",
                  border: "#14532d",
                },
                {
                  stat: "3.0+",
                  label: "Premium Lines Edge",
                  detail: "Picks where the model edge exceeds 3.0 disposals correlate strongly with higher E/V and better win rates. A large raw edge signals the bookmaker has underpriced the line — these are the highest-value opportunities.",
                  color: "#60a5fa",
                  border: "#1e3a5f",
                },
                {
                  stat: "R4",
                  label: "Round 4 Outlier",
                  detail: "Round 4 was the lowest-performing round in the 2026 dataset, driven by a cluster of late team changes and atypical weather across multiple venues. This single-round outlier skews the overall rate downward. Rounds 3, 5, and 6 are better benchmarks for model accuracy.",
                  color: "#f87171",
                  border: "#450a0a",
                },
                {
                  stat: "↑ R6",
                  label: "Improving Trend",
                  detail: "Win rate has trended upward from Round 3 through Round 6 as the model has been recalibrated against live data. Round 6 is the highest-performing round in the 2026 season. More picks = better calibration — early-season samples should be weighted accordingly.",
                  color: "#4ade80",
                  border: "#14532d",
                },
              ].map(card => (
                <div key={card.label} style={{
                  background: "#080808", border: `1px solid ${card.border}`,
                  borderRadius: 10, padding: "20px",
                }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: card.color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
                    {card.stat}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>{card.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: "#444", lineHeight: 1.7, borderTop: "1px solid #111", paddingTop: 24 }}>
            All figures based on {totalPicks} verified picks across {roundsLabel} · {currentSeason} season. Past performance does not guarantee future results.
            Analytics are updated weekly. For methodology, see{" "}
            <a href="/model" style={{ color: "#555", textDecoration: "none" }}>How It Works</a>.
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
