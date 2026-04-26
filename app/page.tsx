"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getCurrentPredictions, getAllResults, getResultStats, getSeasonSummary } from "@/lib/data";
import { roundsLabel, currentSeason } from "@/lib/siteData";
import { TEAM_COLOURS } from "@/lib/teams";
const predictions = getCurrentPredictions();
const highImpactNews = (predictions.team_news ?? []).filter((n: { impact: string }) => n.impact === "HIGH");
const results = getAllResults();
const seasonSummary = getSeasonSummary();
const stats = getResultStats();

const hcPicks = predictions.picks.filter(p => p.enhanced_signal === 'HC' || p.edge_vol >= 0.90);
const tickerPicks = hcPicks.length > 0 ? hcPicks : predictions.picks.filter(p => p.filter_pass);

const features = [
  {
    title: "Disposal prediction model",
    body: "Six-factor weighted model built on 2025 and 2026 season data, opponent concession rates, TOG-adjusted disposal rates, play style, conditions, and availability.",
  },
  {
    title: "Edge/Vol filtering",
    body: "Every pick is scored by Edge divided by Estimated Standard Deviation. Only picks with E/V ≥ 0.50 make the cut — eliminating noise and keeping only statistically meaningful edges.",
  },
  {
    title: "Position-specific thresholds",
    body: "MID, DEF, FWD and RUCK markets price differently. Our STRONG thresholds are calibrated per position based on real backtested accuracy — not a one-size-fits-all number.",
  },
  {
    title: "Transparent track record",
    body: "Every prediction is logged. Every result is tracked. Win rate, MAE, ROI — all published publicly. No cherry picking. No hidden losses.",
  },
  {
    title: "Weight Optimisation Simulator",
    body: "Adjust any model parameter and instantly see how historical accuracy changes across all tracked predictions. Find the optimal configuration before the next round.",
    link: "/simulator",
    linkLabel: "Try the Simulator →",
  },
];

function TickerItem({ player, team, position, direction, bookie_line, edge_vol }: {
  player: string; team: string; position: string;
  direction: string; bookie_line: number; edge_vol: number;
}) {
  const teamColor = TEAM_COLOURS[team]?.primary ?? "#1a1a1a";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "8px 20px 8px 12px",
      background: "#0a0a0a", border: "1px solid #1a1a1a",
      borderLeft: `3px solid ${teamColor}`,
      borderRadius: 8, marginRight: 12, flexShrink: 0,
    }}>
      <PlayerAvatar name={player} team={team} size={28} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f0", whiteSpace: "nowrap" }}>{player}</div>
        <div style={{ fontSize: 10, color: "#888", whiteSpace: "nowrap" }}>
          {position} · {team} · {direction} {bookie_line}
        </div>
      </div>
      <div style={{
        background: "#1a0f00", border: "1px solid #f9731640",
        color: "#f97316", fontSize: 10, fontWeight: 800,
        padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap",
      }}>
        E/V {edge_vol.toFixed(2)}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const lastRound = results[results.length - 1];
  const lastRoundStats = lastRound ? getResultStats([lastRound.round]) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      <Nav />

      {/* ── TICKER ── */}
      <div style={{
        position: "fixed", top: 60, left: 0, right: 0, zIndex: 40,
        borderBottom: "1px solid #111", background: "#000",
        overflow: "hidden", height: 48,
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          fontSize: 9, fontWeight: 700, color: "#f97316",
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "0 14px", whiteSpace: "nowrap", borderRight: "1px solid #1a1a1a",
          height: "100%", display: "flex", alignItems: "center",
          background: "#000", zIndex: 1, flexShrink: 0,
        }}>
          R{predictions.round} HC
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track" style={{ display: "flex", alignItems: "center", height: 48 }}>
            {[...tickerPicks, ...tickerPicks].map((p, i) => (
              <TickerItem key={i} player={p.player} team={p.team} position={p.position}
                direction={p.direction} bookie_line={p.bookie_line} edge_vol={p.edge_vol} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker 40s linear infinite;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Team news alert strip */}
      {highImpactNews.length > 0 && (
        <div style={{
          background: "#1c0a00", borderBottom: "1px solid #78350f",
          padding: "8px 24px", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 12,
        }}>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>
            ⚠ {highImpactNews[0].player_out} ({highImpactNews[0].team}) — team news may affect predictions.
          </span>
          <Link href="/predictions" style={{ fontSize: 11, color: "#fb923c", textDecoration: "none", fontWeight: 600 }}>
            Check picks →
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 148,
        padding: "148px 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#111", border: "1px solid #1f1f1f", borderRadius: 20,
          padding: "5px 12px", marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316" }} />
          <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            AFL · {predictions.season} Season · Round {predictions.round}
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.05,
          margin: "0 0 20px", maxWidth: 800,
        }}>
          The sharpest<br />
          <span style={{ color: "#f97316" }}>AFL disposal</span><br />
          model in Australia.
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)", color: "#666",
          lineHeight: 1.7, maxWidth: 520, margin: "0 0 40px",
        }}>
          Predictive disposal analytics powered by a six-factor model,
          Edge/Vol filtering, and a publicly verified track record.
          Built for serious AFL bettors.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/predictions" style={{
            background: "#f97316", color: "#000",
            padding: "14px 28px", borderRadius: 10,
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            letterSpacing: "-0.01em", display: "inline-block",
          }}>
            View Round {predictions.round} Picks →
          </Link>
          <a href="#how-it-works" style={{
            background: "transparent", color: "#888",
            padding: "14px 28px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, textDecoration: "none",
            border: "1px solid #1f1f1f", display: "inline-block",
          }}>
            How it works
          </a>
        </div>
      </div>

      {/* ── PRO CTA ── */}
      <div style={{
        borderTop: "1px solid #0d0d0d",
        background: "#030303",
        padding: "40px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>
              Start Pro for $29/month
            </div>
            <div style={{ fontSize: 13, color: "#555" }}>
              *No payment required for beta. Full access while we&apos;re live-testing.
            </div>
          </div>
          <Link href="/auth/signup" style={{
            background: "#f97316", color: "#000",
            padding: "12px 24px", borderRadius: 8,
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Get Started — Free Trial*
          </Link>
        </div>
      </div>

      {/* ── SEASON SUMMARY STATS ── */}
      <div style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111", background: "#050505" }}>
        <div className="grid-4-to-2" style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
        }}>
          {[
            { value: `${seasonSummary.strong_rate}%`, label: "HC Win Rate", sub: `${seasonSummary.strong_picks} picks · HIGH CONVICTION tier` },
            { value: `${seasonSummary.filtered_rate}%`, label: "Filtered Win Rate", sub: `${seasonSummary.filtered_picks} picks · E/V ≥ 0.50` },
            { value: seasonSummary.total_picks.toString(), label: "Picks Analysed", sub: `${roundsLabel} · ${currentSeason} season` },
            { value: `${seasonSummary.overall_rate}%`, label: "Overall Win Rate", sub: `All ${seasonSummary.total_picks} picks tracked` },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "28px 20px",
              borderRight: i < 3 ? "1px solid #111" : "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#f97316", letterSpacing: "-0.03em" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LATEST ROUND SUMMARY CARD ── */}
      {lastRound && lastRoundStats && (
        <div style={{ padding: "48px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: "#050505", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: "28px 28px 24px",
            display: "grid", gridTemplateColumns: "1fr auto",
            gap: 24, alignItems: "start",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Latest results
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>
                Round {lastRound.round} · {lastRound.season}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                {lastRound.total_picks} picks tracked — {lastRound.wins}W / {lastRound.losses}L
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {lastRound.picks.filter(p => p.confidence === 'STRONG').slice(0, 4).map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PlayerAvatar name={p.player} team={p.team} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f0" }}>{p.player}</div>
                      <div style={{ fontSize: 10, color: p.result === 'WIN' ? '#22c55e' : '#ef4444' }}>
                        {p.result} · {p.actual} disposals
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#f97316", letterSpacing: "-0.03em" }}>
                {lastRound.win_rate}%
              </div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>Overall win rate</div>
              <Link href="/accuracy" style={{
                fontSize: 12, color: "#f97316", textDecoration: "none",
                fontWeight: 600, letterSpacing: "-0.01em",
              }}>
                Full track record →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <div id="how-it-works" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            The model
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            How SportSphere HQ works
          </h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 1, background: "#111", border: "1px solid #111",
          borderRadius: 12, overflow: "hidden",
        }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "#000", padding: "28px 24px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "#111", border: "1px solid #1f1f1f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#f97316", marginBottom: 16,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.65 }}>{f.body}</div>
              {(f as { link?: string; linkLabel?: string }).link && (
                <Link href={(f as { link: string }).link} style={{
                  display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 700,
                  color: "#f97316", textDecoration: "none", letterSpacing: "-0.01em",
                }}>
                  {(f as { linkLabel?: string }).linkLabel ?? "Learn more →"}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TRACK RECORD TABLE ── */}
      <div style={{ padding: "80px 24px", background: "#050505", borderTop: "1px solid #111", borderBottom: "1px solid #111" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Verified results
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
              Public track record
            </h2>
            <p style={{ fontSize: 14, color: "#555", marginTop: 10, maxWidth: 480 }}>
              Every prediction logged, every result tracked. No cherry picking.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #111" }}>
                  {["Round", "Total Picks", "Overall", "HC (Strong)", "Filtered"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", fontSize: 11, color: "#666",
                      fontWeight: 600, textAlign: "left",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const rr = r as typeof r & { hc_picks?: number; hc_wins?: number; filtered_picks?: number; filtered_wins?: number };
                  const hcRate = rr.hc_picks && rr.hc_wins ? `${((rr.hc_wins / rr.hc_picks) * 100).toFixed(0)}%` : "—";
                  const filtRate = rr.filtered_picks && rr.filtered_wins ? `${((rr.filtered_wins / rr.filtered_picks) * 100).toFixed(0)}%` : "—";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a0a" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#fff" }}>Round {r.round}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#666" }}>{r.total_picks}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#f0f0f0" }}>{r.win_rate}%</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#f97316" }}>
                        {rr.hc_picks ? `${rr.hc_wins}/${rr.hc_picks}` : "—"}
                        {rr.hc_picks ? <span style={{ color: "#555", marginLeft: 6, fontSize: 11 }}>{hcRate}</span> : null}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#22c55e" }}>
                        {rr.filtered_picks ? `${rr.filtered_wins}/${rr.filtered_picks}` : "—"}
                        {rr.filtered_picks ? <span style={{ color: "#555", marginLeft: 6, fontSize: 11 }}>{filtRate}</span> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "100px 24px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 16px",
        }}>
          Ready to analyse with an edge?
        </h2>
        <p style={{ fontSize: 15, color: "#777", margin: "0 0 36px", lineHeight: 1.7 }}>
          View this round's HIGH CONVICTION picks — the tier with a verified {seasonSummary.strong_rate}%+ win rate.
        </p>
        <Link href="/predictions" style={{
          background: "#f97316", color: "#000",
          padding: "16px 36px", borderRadius: 10,
          fontSize: 15, fontWeight: 700, textDecoration: "none",
          letterSpacing: "-0.01em", display: "inline-block",
        }}>
          View Round {predictions.round} Picks →
        </Link>
      </div>

      <Footer />
    </div>
  );
}
