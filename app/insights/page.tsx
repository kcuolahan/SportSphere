import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import results from "@/data/results.json";
import teamStyleData from "@/data/team-style.json";

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
  const { model_bias, by_condition, by_position_condition, by_confidence_condition } = analytics;

  const getPosCond = (pos: string, cond: string) =>
    by_position_condition.find((r: any) => r.position === pos && r.condition === cond);

  // Classify teams into TRANS/STOP for team style section
  const leagueAvgDisposalIndex = 0;
  const teamStyleRows = [...teams].sort((a, b) => a.disposal_index - b.disposal_index);
  const transTeams = teamStyleRows.filter(t => t.disposal_index < -20);
  const stopTeams = teamStyleRows.filter(t => t.disposal_index > 20);
  const midTeams = teamStyleRows.filter(t => Math.abs(t.disposal_index) <= 20);

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
              Performance breakdowns from 457 backtested picks. Understand when the model fires and when to exercise caution.
            </p>
          </div>

          {/* ── SECTION 1: Team Style ── */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <SectionBadge n={1} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Team Style — Disposal Generation</h2>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20, marginLeft: 36, lineHeight: 1.6 }}>
              TRANS-heavy teams move the ball fast via kick chains — their midfielders and defenders accumulate more disposals.
              STOP teams play through stoppages — higher contested possession, lower individual disposal counts.
              Use this when your pick faces a TRANS or STOP opposition.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "TRANS Teams", teams: transTeams, color: "#60a5fa", note: "Players facing TRANS opponents tend to accumulate more disposals — opponents create more ball movement and turnovers to capitalise on." },
                { label: "Balanced", teams: midTeams, color: "#888", note: "Balanced team styles — disposal counts revert toward league average. Standard model prediction applies." },
                { label: "STOP Teams", teams: stopTeams, color: "#f97316", note: "Players facing STOP opponents get fewer uncontested disposals — stoppages dominate. Lower overall disposal volumes." },
              ].map(group => (
                <div key={group.label} style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    {group.label}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    {group.teams.map(t => (
                      <div key={t.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #0d0d0d" }}>
                        <span style={{ fontSize: 12, color: "#e0e0e0", fontWeight: 600 }}>{t.name}</span>
                        <span style={{ fontSize: 11, color: group.color, fontWeight: 700 }}>
                          {t.disposal_index > 0 ? "+" : ""}{t.disposal_index}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#555", margin: 0, lineHeight: 1.6 }}>{group.note}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "#080808", border: "1px solid #f97316", borderRadius: 8, padding: "14px 16px" }}>
              <span style={{ fontSize: 12, color: "#999" }}>
                <strong style={{ color: "#f97316" }}>How to apply:</strong>{" "}
                When a MID or DEF pick faces a TRANS-style team, the model&apos;s OVER prediction has a structural tailwind.
                When facing STOP-heavy opponents, apply extra scrutiny to OVER picks — the disposal environment is more constrained.
                Disposal Index: negative = TRANS (more kick chains), positive = STOP (more stoppages).
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

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: "#444", lineHeight: 1.7, borderTop: "1px solid #111", paddingTop: 24 }}>
            All figures based on backtested data across 457 historical picks. Past performance does not guarantee future results.
            Analytics are updated weekly. For methodology, see{" "}
            <a href="/model" style={{ color: "#555", textDecoration: "none" }}>How It Works</a>.
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
