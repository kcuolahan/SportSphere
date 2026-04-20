"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SignalBadge, ConfidenceBadge } from "@/components/ui/Badge";
import { getCurrentPredictions, getAllResults, getTeamConcession } from "@/lib/data";
import type { Pick, TeamNewsEntry } from "@/lib/data";

const { round, season, generated_at, picks, team_news = [], verified_at } = getCurrentPredictions();

// Look up results for the current round (if complete)
const allResults = getAllResults();
const currentRoundResults = allResults.find(r => r.round === round) ?? null;
const resultsByPlayer: Record<string, { actual: number; result: string; abs_error?: number }> = {};
if (currentRoundResults) {
  for (const p of currentRoundResults.picks as Array<{ player: string; actual: number; result: string; abs_error?: number }>) {
    resultsByPlayer[p.player] = { actual: p.actual, result: p.result, abs_error: p.abs_error };
  }
}

// Venue performance scores for matchup quality (1=worst, 5=best based on model accuracy)
const VENUE_PERF: Record<string, number> = {
  "Adelaide Oval": 5, "AO": 5,
  "Gabba": 4, "GABBA": 4,
  "GMHBA Stadium": 3, "GMHBA": 3,
  "Marvel Stadium": 3, "MRVL": 3,
  "SCG": 3,
  "MCG": 2,
  "Optus Stadium": 1, "OS": 1,
};

type FilterType = "ALL" | "ACTIONABLE" | "SHARP" | "HC";
type ViewType = "CARD" | "TABLE";

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: "help", color: "#555", fontSize: 10, marginLeft: 4 }}
      >ⓘ</span>
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)",
          background: "#111", border: "1px solid #1f1f1f", borderRadius: 6,
          padding: "8px 12px", fontSize: 11, color: "#888",
          width: 220, lineHeight: 1.6, zIndex: 50, pointerEvents: "none",
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

function RoundCompleteBanner() {
  if (!currentRoundResults) return null;
  const { wins, losses, win_rate } = currentRoundResults;
  return (
    <div style={{
      borderLeft: "3px solid #22c55e",
      background: "#030f08",
      border: "1px solid #14532d",
      borderRadius: 8, padding: "14px 18px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12,
      marginBottom: 16, flexWrap: "wrap",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", marginBottom: 2 }}>
          Round {round} Complete — {wins}W / {losses}L ({win_rate}%)
        </div>
        <div style={{ fontSize: 11, color: "#166534" }}>
          Round {round + 1} picks publish Tuesday · Results logged below
        </div>
      </div>
      <span style={{
        fontSize: 9, fontWeight: 800, color: "#000",
        background: "#22c55e", borderRadius: 4,
        padding: "3px 8px", letterSpacing: "0.06em", flexShrink: 0,
      }}>COMPLETE</span>
    </div>
  );
}

function RoundConcludedBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ss_r6_concluded_dismissed") === "1";
  });
  if (dismissed) return null;
  return (
    <div style={{
      background: "#0c0700", border: "1px solid #78350f",
      borderRadius: 8, padding: "12px 16px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12,
      marginBottom: 16,
    }}>
      <p style={{ fontSize: 12, color: "#f59e0b", margin: 0, flex: 1, lineHeight: 1.6 }}>
        ⚠ Round 6 has concluded. Results will be logged shortly. Round 7 picks will be published Tuesday.
      </p>
      <button
        onClick={() => {
          localStorage.setItem("ss_r6_concluded_dismissed", "1");
          setDismissed(true);
        }}
        style={{
          background: "none", border: "1px solid #78350f",
          borderRadius: 4, padding: "4px 10px",
          fontSize: 10, color: "#f59e0b", cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ss_disclaimer_dismissed") === "1";
  });

  if (dismissed) return null;

  return (
    <div style={{
      background: "#080808", border: "1px solid #1f1f1f",
      borderRadius: 8, padding: "12px 16px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12,
      marginBottom: 20, flexWrap: "wrap",
    }}>
      <p style={{ fontSize: 11, color: "#666", margin: 0, flex: 1, lineHeight: 1.6 }}>
        SportSphere provides model outputs for analytical purposes only. Not financial or betting advice. 18+ only. Gamble responsibly.
      </p>
      <button
        onClick={() => {
          localStorage.setItem("ss_disclaimer_dismissed", "1");
          setDismissed(true);
        }}
        style={{
          background: "none", border: "1px solid #1f1f1f",
          borderRadius: 4, padding: "4px 10px",
          fontSize: 10, color: "#555", cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

const VENUE_ALERTS: Record<string, { level: "warn" | "good" | "caution"; msg: string }> = {
  "Optus Stadium": { level: "warn", msg: "⚠ Optus Stadium — model has 42.5% accuracy here. Exercise caution." },
  "OS": { level: "warn", msg: "⚠ Optus Stadium — model has 42.5% accuracy here. Exercise caution." },
  "Adelaide Oval": { level: "good", msg: "✅ Adelaide Oval — best venue for model accuracy (57.1%)" },
  "AO": { level: "good", msg: "✅ Adelaide Oval — best venue for model accuracy (57.1%)" },
  "MCG": { level: "caution", msg: "⚠ MCG — model over-predicts here. Prefer UNDER direction." },
};

function OppFactorText(pick: Pick) {
  const concession = getTeamConcession(pick.opponent, pick.position);
  if (!concession) return null;
  const diff = concession.vs_league;
  if (Math.abs(diff) < 0.02) return (
    <span style={{ color: "#888" }}>{pick.opponent} concede at league average for {pick.position}s.</span>
  );
  if (diff > 0) return (
    <span style={{ color: "#22c55e" }}>{pick.opponent} concede <strong>+{(diff * 100).toFixed(0)}% above</strong> league avg to {pick.position}s — favourable matchup.</span>
  );
  return (
    <span style={{ color: "#ef4444" }}>{pick.opponent} concede <strong>{(diff * 100).toFixed(0)}% below</strong> league avg to {pick.position}s — tough matchup.</span>
  );
}

function TeamNewsBanner({ news }: { news: TeamNewsEntry[] }) {
  const [open, setOpen] = useState(false);
  if (news.length === 0) return null;
  const impactColor = (impact: string) =>
    impact === "HIGH" ? "#f59e0b" : impact === "MEDIUM" ? "#3b82f6" : "#666";
  return (
    <div style={{
      background: "#0c0700", border: "1px solid #78350f",
      borderRadius: 8, marginBottom: 16, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none",
          padding: "12px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>
          ⚠ TEAM NEWS — Check before betting ({news.length})
        </span>
        <span style={{ fontSize: 12, color: "#666" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #1c1000" }}>
          {news.map((n, i) => (
            <div key={i} style={{ paddingTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>{n.team}</span>
                <span style={{ fontSize: 11, color: "#555" }}>— {n.player_out} out</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: impactColor(n.impact),
                  background: "rgba(0,0,0,0.4)", border: `1px solid ${impactColor(n.impact)}`,
                  padding: "1px 5px", borderRadius: 3, letterSpacing: "0.06em",
                }}>{n.impact}</span>
              </div>
              {n.note && <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{n.note}</div>}
              {n.affects_players.length > 0 && (
                <div style={{ fontSize: 11, color: "#555" }}>
                  Affects: {n.affects_players.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfidenceExplainer({ confidence }: { confidence: string }) {
  const map: Record<string, { color: string; text: string }> = {
    STRONG: { color: "#f97316", text: "E/V ≥ 0.90 — highest conviction tier. MID/DEF ≥3.0 edge required." },
    MODERATE: { color: "#facc15", text: "E/V 0.50–0.89 — actionable edge, lower conviction than STRONG." },
    LEAN: { color: "#888", text: "E/V < 0.50 — marginal edge. Shown for reference only, not recommended." },
  };
  const c = map[confidence] ?? map.LEAN;
  return (
    <span style={{ fontSize: 10, color: c.color, marginLeft: 6 }} title={c.text}>
      ({c.text.split("—")[0].trim()})
    </span>
  );
}

function calcMatchupScore(pred: Pick): number {
  const dvpRaw = getTeamConcession(pred.opponent, pred.position)?.vs_league ?? 0;
  const dvp = dvpRaw > 0.10 ? 2 : dvpRaw > 0 ? 1.5 : dvpRaw > -0.05 ? 1 : 0;
  const venueScore = (VENUE_PERF[pred.venue] ?? 3) / 5 * 2;
  const cond = pred.condition === "Wet" ? 0 : 1;
  return Math.min(5, Math.round((dvp + venueScore + cond) * 10) / 10);
}

export default function PredictionsPage() {
  const [filter, setFilter] = useState<FilterType>("ACTIONABLE");
  const [view, setView] = useState<ViewType>("CARD");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [verifiedAgeWarn, setVerifiedAgeWarn] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (verified_at) {
      const ageMs = Date.now() - new Date(verified_at).getTime();
      setVerifiedAgeWarn(ageMs > 48 * 60 * 60 * 1000);
    }
  }, []);

  function handleShare() {
    const hcPicks = picks.filter((p: Pick) => p.enhanced_signal === "HC");
    const betPicks = picks.filter((p: Pick) => p.enhanced_signal === "BET");
    const fmt = (p: Pick) => `  ${p.player} ${p.direction} ${p.bookie_line} (E/V ${p.edge_vol.toFixed(2)})`;
    const text = [
      `Round ${round} AFL disposal picks — SportSphere model`,
      "",
      hcPicks.length ? `HC picks:\n${hcPicks.map(fmt).join("\n")}` : "",
      betPicks.length ? `BET picks:\n${betPicks.map(fmt).join("\n")}` : "",
      "",
      `Track record: 59% filtered win rate | 67.7% STRONG`,
      `Full analysis: sport-sphere-ruddy.vercel.app/predictions`,
      "#AFL #SportSphere",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  const filtered = picks.filter((p: Pick) => {
    if (filter === "ACTIONABLE") return p.filter_pass;
    if (filter === "SHARP") return p.edge_vol >= 0.70 && p.edge_vol < 0.90;
    if (filter === "HC") return p.enhanced_signal === "HC";
    return true;
  });

  const hcCount = picks.filter((p: Pick) => p.enhanced_signal === "HC").length;
  const betCount = picks.filter((p: Pick) => p.filter_pass).length;
  const overCount = filtered.filter((p: Pick) => p.direction === "OVER").length;
  const underCount = filtered.filter((p: Pick) => p.direction === "UNDER").length;

  const generatedDate = new Date(generated_at).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "84px 20px 60px" }}>
        <RoundCompleteBanner />
        <RoundConcludedBanner />
        <DisclaimerBanner />

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
            Round {round} Analysis
          </h1>
          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
            AFL player disposal props · {season} · Generated {generatedDate} · Sorted by conviction score
          </p>
          {verified_at && (
            <p style={{ fontSize: 11, color: "#555", margin: "6px 0 0" }}>
              Predictions last verified against team news:{" "}
              {new Date(verified_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          {verifiedAgeWarn && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#1c0a00", border: "1px solid #78350f", borderRadius: 6, fontSize: 11, color: "#f59e0b" }}>
              ⚠ Check team news before betting — predictions may not reflect latest squad changes.
            </div>
          )}
        </div>

        <TeamNewsBanner news={team_news as TeamNewsEntry[]} />

        {/* Stats */}
        <div className="pick-stats-grid">
          {[
            { label: "Total Picks", value: picks.length, color: "#f0f0f0" },
            { label: "High Conv.", value: hcCount, color: "#f97316" },
            { label: "Actionable", value: betCount, color: "#22c55e" },
            { label: "OVER/UNDER", value: `${overCount}/${underCount}`, color: "#60a5fa" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#0a0a0a", border: "1px solid #111",
              borderRadius: 10, padding: "12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Model explainer banner */}
        <div style={{
          background: "#050505", border: "1px solid #1a1a1a",
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        }}>
          {[
            { tier: "HC", ev: "E/V ≥ 0.90", color: "#f97316", desc: "High Conviction — top tier picks" },
            { tier: "SHARP", ev: "E/V 0.70–0.89", color: "#60a5fa", desc: "Sharp edge — strong value picks" },
            { tier: "BET", ev: "E/V 0.50–0.69", color: "#22c55e", desc: "Actionable edge — good value" },
            { tier: "SKIP", ev: "E/V < 0.50", color: "#666", desc: "Below threshold — shown for reference" },
          ].map(t => (
            <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 20, borderRadius: 4, background: t.color + "20",
                border: `1px solid ${t.color}40`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 9, fontWeight: 800, color: t.color,
                flexShrink: 0,
              }}>{t.tier}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.color }}>{t.ev}</div>
                <div style={{ fontSize: 10, color: "#666" }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + view toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["ALL", "ACTIONABLE", "SHARP", "HC"] as FilterType[]).map(tab => {
              const LABELS: Record<FilterType, string> = { ALL: "All", ACTIONABLE: "Bets", SHARP: "Sharp", HC: "HC Only" };
              const COLORS: Record<FilterType, string> = { ALL: "#f97316", ACTIONABLE: "#f97316", SHARP: "#60a5fa", HC: "#f97316" };
              const ac = COLORS[tab];
              return (
                <button key={tab} onClick={() => setFilter(tab)} style={{
                  padding: "7px 14px", borderRadius: 7,
                  border: filter === tab ? `1px solid ${ac}` : "1px solid #111",
                  background: filter === tab ? ac : "#0a0a0a",
                  color: filter === tab ? "#000" : "#555",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {LABELS[tab]}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#555", marginRight: 6 }}>
              {filtered.length} of {picks.length} picks
            </span>
            <button onClick={handleShare} style={{
              padding: "6px 12px", borderRadius: 6,
              border: "1px solid #1f1f1f",
              background: shareCopied ? "#052e16" : "#0a0a0a",
              color: shareCopied ? "#4ade80" : "#555",
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.06em", textTransform: "uppercase",
              transition: "all 0.2s",
            }}>
              {shareCopied ? "✓ Copied" : "Share"}
            </button>
            {(["CARD", "TABLE"] as ViewType[]).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 12px", borderRadius: 6,
                border: view === v ? "1px solid #f97316" : "1px solid #111",
                background: view === v ? "#f9731615" : "#0a0a0a",
                color: view === v ? "#f97316" : "#666",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* TABLE VIEW */}
        {view === "TABLE" && (
          <div className="picks-table-view" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #111" }}>
                  {["Player", "Pos", "vs", "Line", "Model", "Edge", "E/V", "Signal", "Direction", ...(currentRoundResults ? ["Result"] : [])].map(h => (
                    <th key={h} style={{
                      padding: "8px 12px", fontSize: 10, color: "#555",
                      fontWeight: 600, textAlign: "left",
                      letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: Pick) => (
                  <tr key={p.player} style={{ borderBottom: "1px solid #0a0a0a" }}
                    onClick={() => setExpanded(expanded === p.player ? null : p.player)}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PlayerAvatar name={p.player} team={p.team} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0", whiteSpace: "nowrap" }}>{p.player}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#555" }}>{p.position}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>{p.opponent}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.bookie_line}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#f97316" }}>{p.predicted}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: p.edge > 0 ? "#22c55e" : "#ef4444" }}>
                      {p.edge > 0 ? "+" : ""}{p.edge}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>{p.edge_vol.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px" }}><SignalBadge signal={p.enhanced_signal} /></td>
                    <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: p.direction === "OVER" ? "#22c55e" : "#ef4444" }}>
                      {p.direction}
                    </td>
                    {currentRoundResults && (() => {
                      const res = resultsByPlayer[p.player];
                      if (!res) return <td style={{ padding: "10px 12px", fontSize: 11, color: "#333" }}>—</td>;
                      const isWin = res.result === "WIN";
                      return (
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: isWin ? "#4ade80" : "#f87171" }}>
                            {isWin ? "✓" : "✗"} {res.actual}
                          </span>
                          {res.abs_error != null && (
                            <span style={{ fontSize: 10, color: "#555", marginLeft: 4 }}>
                              (off {res.abs_error})
                            </span>
                          )}
                        </td>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CARD VIEW */}
        {view === "CARD" && (
          <div className="picks-card-view" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((pred: Pick) => {
              const isHC = pred.enhanced_signal === "HC";
              const isBet = pred.enhanced_signal === "BET";
              const isOver = pred.direction === "OVER";
              const isExpanded = expanded === pred.player;

              return (
                <div
                  key={pred.player}
                  onClick={() => setExpanded(isExpanded ? null : pred.player)}
                  style={{
                    background: isHC ? "#0d0800" : "#080808",
                    border: isHC ? "1px solid #f9731630" : "1px solid #111",
                    borderRadius: 10,
                    padding: "14px 16px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {isHC && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#f97316" }} />}

                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: isHC ? 8 : 0, flexWrap: "wrap" }}>
                    <PlayerAvatar name={pred.player} team={pred.team} size={44} />

                    {/* Player info */}
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{pred.player}</div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 1 }}>
                        {pred.team} vs {pred.opponent}
                      </div>
                      <div style={{ fontSize: 11, color: "#666" }}>
                        {pred.venue} · {pred.position}
                      </div>
                      {(team_news as TeamNewsEntry[]).some(n => n.affects_players.includes(pred.player)) && (
                        <div style={{
                          display: "inline-block", marginTop: 3,
                          fontSize: 9, fontWeight: 700, color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                          padding: "1px 6px", borderRadius: 3, letterSpacing: "0.05em",
                        }}>⚠ Team news — verify</div>
                      )}
                    </div>

                    {/* Numbers */}
                    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>Line</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0" }}>{pred.bookie_line}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>Model</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f97316" }}>{pred.predicted}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>Edge</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: pred.edge > 0 ? "#22c55e" : "#ef4444" }}>
                          {pred.edge > 0 ? "+" : ""}{pred.edge}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>
                          E/V
                          <Tooltip text="Edge/Vol = Edge ÷ Std Dev. Measures statistical significance. ≥ 0.50 = actionable, ≥ 0.90 = HIGH CONVICTION." />
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa" }}>{pred.edge_vol.toFixed(2)}</div>
                      </div>
                      {(() => {
                        const score = calcMatchupScore(pred);
                        const scoreColor = score >= 4 ? "#4ade80" : score >= 3 ? "#facc15" : "#f87171";
                        return (
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>Matchup</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>
                              {"★".repeat(Math.round(score))}{"☆".repeat(5 - Math.round(score))}
                            </div>
                          </div>
                        );
                      })()}
                      <div style={{
                        fontSize: 12, fontWeight: 800, minWidth: 58,
                        color: isOver ? "#22c55e" : "#ef4444",
                      }}>
                        {pred.direction} {isOver ? "⬆" : "⬇"}
                      </div>
                    </div>
                  </div>

                  {/* Expanded model breakdown */}
                  {isExpanded && (
                    <div style={{
                      marginTop: 14, paddingTop: 14,
                      borderTop: "1px solid #111",
                      paddingLeft: isHC ? 8 : 0,
                    }}>
                      {/* Opponent factor text */}
                      <div style={{
                        background: "#050505", border: "1px solid #111",
                        borderRadius: 6, padding: "8px 12px", marginBottom: 10,
                        fontSize: 12, lineHeight: 1.6,
                      }}>
                        <OppFactorText {...pred} />
                      </div>

                      {/* Venue alert */}
                      {VENUE_ALERTS[pred.venue] && (() => {
                        const alert = VENUE_ALERTS[pred.venue];
                        const borderColor = alert.level === "good" ? "#14532d" : alert.level === "warn" ? "#7f1d1d" : "#78350f";
                        const bgColor = alert.level === "good" ? "rgba(5,46,22,0.5)" : alert.level === "warn" ? "rgba(69,10,10,0.5)" : "rgba(28,14,0,0.5)";
                        const textColor = alert.level === "good" ? "#4ade80" : alert.level === "warn" ? "#f87171" : "#fb923c";
                        return (
                          <div style={{
                            background: bgColor, border: `1px solid ${borderColor}`,
                            borderRadius: 6, padding: "8px 12px", marginBottom: 10,
                            fontSize: 12, color: textColor, lineHeight: 1.5,
                          }}>
                            {alert.msg}
                          </div>
                        );
                      })()}

                      {/* Team news context in expanded view */}
                      {(team_news as TeamNewsEntry[])
                        .filter(n => n.affects_players.includes(pred.player))
                        .map((n, i) => (
                          <div key={i} style={{
                            background: "#1c0a00", border: "1px solid #78350f",
                            borderRadius: 6, padding: "8px 12px", marginBottom: 10,
                            fontSize: 12, color: "#f59e0b",
                          }}>
                            ⚠ Team news: {n.player_out} ({n.team}) — {n.note}
                          </div>
                        ))}

                      {/* Round result */}
                      {(() => {
                        const res = resultsByPlayer[pred.player];
                        if (!res) return null;
                        const isWin = res.result === "WIN";
                        return (
                          <div style={{
                            background: isWin ? "#030f08" : "#100303",
                            border: `1px solid ${isWin ? "#14532d" : "#450a0a"}`,
                            borderRadius: 6, padding: "10px 14px", marginBottom: 10,
                            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: isWin ? "#4ade80" : "#f87171" }}>
                              {isWin ? "✓ WIN" : "✗ LOSS"}
                            </span>
                            <span style={{ fontSize: 12, color: "#888" }}>
                              Model: {pred.predicted} · Actual: {res.actual}
                              {res.abs_error != null && ` · Off by ${res.abs_error}`}
                            </span>
                          </div>
                        );
                      })()}

                      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                        Model Breakdown
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
                        {[
                          { label: "2025 Avg", value: pred.avg_2025.toFixed(1) },
                          { label: "2026 Avg", value: pred.avg_2026.toFixed(1) },
                          { label: "Opp Factor", value: `×${pred.opp_factor.toFixed(3)}` },
                          { label: "Team Style", value: pred.team_style_index > 0 ? `+${pred.team_style_index}` : pred.team_style_index.toString() },
                          { label: "CBA%", value: pred.cba_pct > 0 ? `${(pred.cba_pct * 100).toFixed(0)}%` : "—" },
                          { label: "Condition", value: pred.condition },
                          { label: "Play Style", value: pred.play_style },
                          { label: "Volatility", value: pred.volatility_tier },
                          { label: "Std Dev", value: pred.std_dev.toFixed(1) },
                          { label: "Confidence", value: <ConfidenceBadge confidence={pred.confidence} /> },
                        ].map((item, idx) => (
                          <div key={idx} style={{
                            background: "#050505", border: "1px solid #111",
                            borderRadius: 6, padding: "8px 10px",
                          }}>
                            <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{item.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#555", lineHeight: 1.8 }}>
            Analytics only · Not financial advice · Edge/Vol ≥ 0.50 filter applied · FWDs excluded from bet filter
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
