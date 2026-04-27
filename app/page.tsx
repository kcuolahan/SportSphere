"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getAllResults, getResultStats } from "@/lib/data";
import { roundsLabel, currentSeason } from "@/lib/siteData";
import { useStats } from "@/lib/useStats";
import { useProAccess } from "@/lib/auth";
import { TEAM_COLOURS } from "@/lib/teams";
import { getCurrentPredictions } from "@/lib/data";

const predictions = getCurrentPredictions();
const results = getAllResults();

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const liveStats = useStats();
  const { isPro } = useProAccess();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const lastRound = results[results.length - 1];
  const lastRoundStats = lastRound ? getResultStats([lastRound.round]) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      <Nav />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .grid-4-to-2 { display: grid; grid-template-columns: repeat(4,1fr); }
        @media (max-width: 640px) {
          .grid-4-to-2 { grid-template-columns: repeat(2,1fr) !important; }
          .hero-cta-row { flex-direction: column !important; }
          .latest-round-card { grid-template-columns: 1fr !important; }
          .sport-tiles { grid-template-columns: 1fr !important; }
        }
        .ticker-track {
          animation: ticker 40s linear infinite;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── TICKER ── */}
      <div style={{
        position: "fixed", top: 60, left: 0, right: 0, zIndex: 40,
        borderBottom: "1px solid #111", background: "#000",
        overflow: "hidden", height: 44,
        display: "flex", alignItems: "center",
      }}>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track" style={{ display: "flex", alignItems: "center", height: 44 }}>
            {[...Array(4)].flatMap((_, rep) =>
              [
                { text: `AFL · 67.6% HC Win Rate · R3 to R7`, highlight: false },
                { text: "+$18,760 Gross P&L · 2026 Season", highlight: false },
                { text: "71 HC Picks Tracked", highlight: false },
                { text: "NBA · Coming Late 2026", highlight: false },
                { text: "NFL · Coming Late 2026", highlight: false },
                { text: "Get Pro - $29/month →", highlight: true },
              ].map((item, i) => (
                <Link key={`${rep}-${i}`} href="/auth/payment" style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "0 28px", height: 44, gap: 8,
                  fontSize: 11, fontWeight: item.highlight ? 700 : 400,
                  color: item.highlight ? "#f97316" : "#444",
                  textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                  borderRight: "1px solid #0d0d0d",
                }}>
                  {item.highlight && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />}
                  {item.text}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{
        padding: "144px 24px 72px",
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
            Multi-sport analytics platform
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.05,
          margin: "0 0 20px", maxWidth: 820,
        }}>
          Sports analytics<br />
          with a <span style={{ color: "#f97316" }}>verified edge.</span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)", color: "#666",
          lineHeight: 1.7, maxWidth: 520, margin: "0 0 40px",
        }}>
          Predictive models, transparent track records, and data tools for
          serious sports bettors and fantasy players. AFL live now. NBA and NFL coming.
        </p>

        <div className="hero-cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/afl" style={{
            background: "#f97316", color: "#000",
            padding: "14px 28px", borderRadius: 10,
            fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}>
            Explore AFL Analytics →
          </Link>
          <Link href="/auth/payment" style={{
            background: "transparent", color: "#888",
            padding: "14px 28px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, textDecoration: "none",
            border: "1px solid #1f1f1f",
          }}>
            Get Pro - $29/month
          </Link>
        </div>
      </div>

      {/* ── SPORT TILES ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        <div className="sport-tiles" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>

          {/* AFL — LIVE */}
          <Link href="/afl" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#080808",
              border: "1px solid rgba(249,115,22,0.4)",
              borderRadius: 12, padding: "28px 24px",
              position: "relative", overflow: "hidden",
              transition: "border-color 0.15s",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: "#f97316", color: "#000",
                fontSize: 9, fontWeight: 800, padding: "2px 7px",
                borderRadius: 3, letterSpacing: "0.08em",
              }}>LIVE</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>AFL</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Disposal Analytics</div>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 20px" }}>
                67.6% HC win rate. 71 picks tracked. Round {predictions.round} picks live.
              </p>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>Explore AFL →</div>
            </div>
          </Link>

          {/* NBA — COMING SOON */}
          <Link href="/nba" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#080808",
              border: "1px solid #1a1a1a",
              borderRadius: 12, padding: "28px 24px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: "#1a1a1a", color: "#555",
                fontSize: 9, fontWeight: 800, padding: "2px 7px",
                borderRadius: 3, letterSpacing: "0.08em",
              }}>COMING SOON</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>NBA</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#777", marginBottom: 8 }}>Player Props</div>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: "0 0 20px" }}>
                Points, assists and rebounds predictions. Same methodology.
              </p>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>Join Waitlist →</div>
            </div>
          </Link>

          {/* NFL — COMING SOON */}
          <Link href="/nfl" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#080808",
              border: "1px solid #1a1a1a",
              borderRadius: 12, padding: "28px 24px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: "#1a1a1a", color: "#555",
                fontSize: 9, fontWeight: 800, padding: "2px 7px",
                borderRadius: 3, letterSpacing: "0.08em",
              }}>COMING SOON</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>NFL</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#777", marginBottom: 8 }}>Player Props</div>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: "0 0 20px" }}>
                Receiving yards, rushing yards, touchdowns. Backtested model.
              </p>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>Join Waitlist →</div>
            </div>
          </Link>

        </div>
      </div>

      {/* ── PLATFORM STATS ── */}
      <div style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111", background: "#050505" }}>
        <div className="grid-4-to-2" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          {[
            { value: `${liveStats.hc.winRatePct}%`, label: "AFL HC Win Rate", sub: `${liveStats.hc.wins}W · ${liveStats.hc.losses}L · HIGH CONVICTION` },
            { value: `+$${liveStats.hc.grossPL.toLocaleString()}`, label: "AFL 2026 Gross P&L", sub: `${liveStats.projections.roundsTracked} rounds tracked` },
            { value: liveStats.hc.totalPicks.toString(), label: "AFL HC Picks", sub: `${roundsLabel} · ${currentSeason} season` },
            { value: `${liveStats.hc.roiPct}%`, label: "ROI", sub: `$1,000 stake · 1.87 avg odds` },
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
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LATEST ROUND CARD ── */}
      {lastRound && lastRoundStats && (
        <div style={{ padding: "48px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
          <div className="latest-round-card" style={{
            background: "#050505", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: "28px 28px 24px",
            display: "grid", gridTemplateColumns: "1fr auto",
            gap: 24, alignItems: "start",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Latest AFL results
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
              <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>HC win rate</div>
              <Link href="/accuracy" style={{
                fontSize: 12, color: "#f97316", textDecoration: "none",
                fontWeight: 600,
              }}>
                Full track record →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── WHAT MAKES IT DIFFERENT ── */}
      <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Platform
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            What makes it different
          </h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 1, background: "#111", border: "1px solid #111",
          borderRadius: 12, overflow: "hidden",
        }}>
          {[
            {
              num: "01",
              title: "Verified track record",
              body: "Every pick logged. Every result tracked. Win rate, MAE, ROI — all published publicly. No cherry picking. No hidden losses. This is the only tier we market.",
            },
            {
              num: "02",
              title: "Edge/Vol filtering",
              body: "Every pick is scored by Edge divided by Estimated Standard Deviation. Only picks with E/V ≥ 0.50 make the cut — eliminating noise and keeping only statistically meaningful edges.",
            },
            {
              num: "03",
              title: "Transparent methodology",
              body: "The model is explained, not a black box. Six-factor weighted system built on disposal rates, DvP matchups, TOG, conditions and availability. You can see exactly why each pick was made.",
            },
            {
              num: "04",
              title: "Coming: Cross-sport fantasy",
              body: "A season-long fantasy competition across AFL, NBA and NFL. Draft players, earn XP, and compete using the same model that powers our betting analytics. Launching 2027.",
              link: "/fantasy",
              linkLabel: "Learn about Fantasy →",
            },
          ].map((f, i) => (
            <div key={i} style={{ background: "#000", padding: "28px 24px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "#111", border: "1px solid #1f1f1f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#f97316", marginBottom: 16,
              }}>
                {f.num}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.65 }}>{f.body}</div>
              {f.link && (
                <Link href={f.link} style={{
                  display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 700,
                  color: "#f97316", textDecoration: "none",
                }}>
                  {f.linkLabel}
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
              Verified results — AFL
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
              HC Pick Performance
            </h2>
            <p style={{ fontSize: 14, color: "#555", marginTop: 10, maxWidth: 560 }}>
              HC filtered picks only. STRONG confidence + E/V above 0.50. The exact tier published to subscribers each week.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #111" }}>
                  {["Round", "HC Picks", "W", "L", "HC Win Rate", "Net P&L"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", fontSize: 11, color: "#666",
                      fontWeight: 600, textAlign: "left",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { round: 3,  picks: 14, wins: 12, losses: 2,  winRate: 85.7, netPL:  8440 },
                  { round: 4,  picks: 19, wins: 9,  losses: 10, winRate: 47.4, netPL: -2170 },
                  { round: 5,  picks: 12, wins: 8,  losses: 4,  winRate: 66.7, netPL:  2960 },
                  { round: 6,  picks: 14, wins: 9,  losses: 5,  winRate: 64.3, netPL:  2830 },
                  { round: 7,  picks: 12, wins: 10, losses: 2,  winRate: 83.3, netPL:  6700 },
                ].map((r, i) => {
                  const wrColor = r.winRate >= 65 ? "#4ade80" : r.winRate >= 50 ? "#f97316" : "#ef4444";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a0a" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#fff" }}>R{r.round}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{r.picks}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{r.wins}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{r.losses}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: wrColor }}>{r.winRate}%</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: r.netPL >= 0 ? "#4ade80" : "#ef4444" }}>
                        {r.netPL >= 0 ? "+" : ""}${r.netPL.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: "2px solid rgba(249,115,22,0.3)", background: "#0a0a0a" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#f97316" }}>TOTAL</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>71</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#4ade80" }}>48</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#ef4444" }}>23</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#4ade80" }}>67.6%</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#4ade80" }}>+$18,760</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "#444", marginTop: 12, lineHeight: 1.7 }}>
            HC picks only. R4 loss included for full transparency. $1,000 flat stake, 1.87 avg odds.
          </p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "100px 24px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
          AFL · Live now
        </div>
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 16px",
        }}>
          Start with AFL.<br />More sports coming.
        </h2>
        <p style={{ fontSize: 15, color: "#777", margin: "0 0 36px", lineHeight: 1.7 }}>
          {liveStats.hc.winRatePct}% HC win rate across {roundsLabel}. Pro subscribers get full access to picks, DvP, simulator and more.
        </p>
        <Link href="/auth/payment" style={{
          background: "#f97316", color: "#000",
          padding: "16px 36px", borderRadius: 10,
          fontSize: 15, fontWeight: 700, textDecoration: "none",
          display: "inline-block",
        }}>
          Get Pro - $29/month
        </Link>
        <div style={{ marginTop: 16, fontSize: 13, color: "#444" }}>
          Includes AFL picks, simulator, DvP, track record and Fantasy when it launches.
        </div>
      </div>

      <Footer />
    </div>
  );
}
