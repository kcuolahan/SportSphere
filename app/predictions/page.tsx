"use client";

import { useState, useEffect, useMemo } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SignalBadge, ConfidenceBadge } from "@/components/ui/Badge";
import { getCurrentPredictions, getAllResults, getTeamConcession } from "@/lib/data";
import type { Pick, TeamNewsEntry, SuppressionScore, Fixture } from "@/lib/data";
import { useProAccess } from "@/lib/auth";
import { filterPicksForTier, shouldShowProPrompt } from "@/lib/paywall";
import { FreeTierPaywall } from "@/components/FreeTierPaywall";
import { FreeTierPnLCard } from "@/components/FreeTierPnLCard";
import livePicksData from "@/data/live-picks.json";
import { roundResults as calcRoundResults } from "@/lib/results";

const { round, season, generated_at, team_news = [], verified_at, fixtures = [] } = getCurrentPredictions();
const picks = [...getCurrentPredictions().picks].sort((a, b) => b.edge_vol - a.edge_vol);

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
type ViewType = "CARD" | "TABLE" | "GAME";

// ── Game grouping helpers ─────────────────────────────────────────────────────
function gameKey(teamA: string, teamB: string) {
  return [teamA, teamB].sort().join("_");
}

function findFixture(pick: Pick, fixtureList: Fixture[]): Fixture | null {
  return fixtureList.find(f =>
    (f.home === pick.team && f.away === pick.opponent) ||
    (f.away === pick.team && f.home === pick.opponent)
  ) ?? null;
}

const DAY_ORDER: Record<string, number> = { Friday: 0, Saturday: 1, Sunday: 2, Monday: 3 };

function fixtureSort(a: Fixture, b: Fixture) {
  const dayDiff = (DAY_ORDER[a.day] ?? 9) - (DAY_ORDER[b.day] ?? 9);
  if (dayDiff !== 0) return dayDiff;
  return a.time.localeCompare(b.time);
}

function calcCombinedOdds(count: number, single = 1.87): number {
  return Math.round(Math.pow(single, count) * 100) / 100;
}

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

function RoundStatusBanner() {
  if (currentRoundResults) return null; // RoundCompleteBanner handles this case
  const lastCompletedRound = allResults.length > 0 ? Math.max(...allResults.map(r => r.round)) : 0;

  if (round > lastCompletedRound) {
    return (
      <div style={{
        background: "#030f08", border: "1px solid #14532d",
        borderRadius: 8, padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 16,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
          Round {round} — Live · Picks locked in for this weekend
        </span>
      </div>
    );
  }

  if (round === lastCompletedRound) {
    return (
      <div style={{
        background: "#0c0700", border: "1px solid #78350f",
        borderRadius: 8, padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 12, color: "#f59e0b" }}>
          ⚠ Round {round} complete — results being logged
        </span>
      </div>
    );
  }

  return null;
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
        SportSphere HQ provides model outputs for analytical purposes only. Not financial or betting advice. 18+ only. Gamble responsibly.
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

const VENUE_ALERTS: Record<string, { level: "warn" | "good" | "caution" | "info"; msg: string }> = {
  "Optus Stadium": { level: "warn", msg: "⚠ Optus Stadium — model's weakest venue (42.5% accuracy). Extra caution advised." },
  "OS": { level: "warn", msg: "⚠ Optus Stadium — model's weakest venue (42.5% accuracy). Extra caution advised." },
  "Adelaide Oval": { level: "good", msg: "✅ Adelaide Oval — model's best venue (57.1% accuracy)" },
  "AO": { level: "good", msg: "✅ Adelaide Oval — model's best venue (57.1% accuracy)" },
  "MCG": { level: "caution", msg: "⚠ MCG — model over-predicts here. Prefer UNDER direction." },
  "MRVL": { level: "info", msg: "Marvel Stadium — Roof venue, slightly higher disposal counts expected." },
  "Marvel Stadium": { level: "info", msg: "Marvel Stadium — Roof venue, slightly higher disposal counts expected." },
  "G": { level: "good", msg: "✅ The Gabba — model performs well here (60% accuracy)." },
  "GABBA": { level: "good", msg: "✅ The Gabba — model performs well here (60% accuracy)." },
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
  const { isPro, loading: proLoading } = useProAccess();
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const [filter, setFilter] = useState<FilterType>("ACTIONABLE");
  const [view, setView] = useState<ViewType>("CARD");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [verifiedAgeWarn, setVerifiedAgeWarn] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [multiCopied, setMultiCopied] = useState(false);

  function toggleMulti(player: string) {
    setMultiSelected(prev =>
      prev.includes(player) ? prev.filter(p => p !== player) : [...prev, player]
    );
  }

  function copyMulti() {
    const lines = multiSelected.map(name => {
      const p = picks.find(pk => pk.player === name);
      return p ? `${name} ${p.direction} ${p.bookie_line}` : name;
    });
    const odds = calcCombinedOdds(multiSelected.length);
    const text = `${lines.join(" + ")} = $${odds}\n(${multiSelected.length}-leg multi @ $1.87 each)`;
    navigator.clipboard.writeText(text).then(() => {
      setMultiCopied(true);
      setTimeout(() => setMultiCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (verified_at) {
      const ageMs = Date.now() - new Date(verified_at).getTime();
      setVerifiedAgeWarn(ageMs > 48 * 60 * 60 * 1000);
    }
  }, []);

  function handleShare() {
    const hcPicks = picks.filter(isHCPick);
    const betPicks = picks.filter((p: Pick) => p.enhanced_signal === "BET");
    const fmt = (p: Pick) => `  ${p.player} ${p.direction} ${p.bookie_line} (E/V ${p.edge_vol.toFixed(2)})`;
    const text = [
      `Round ${round} AFL disposal picks — SportSphere HQ model`,
      "",
      hcPicks.length ? `HC picks:\n${hcPicks.map(fmt).join("\n")}` : "",
      betPicks.length ? `BET picks:\n${betPicks.map(fmt).join("\n")}` : "",
      "",
      `Track record: 59% filtered win rate | 67.7% STRONG`,
      `Full analysis: sportspherehq.com/predictions`,
      "#AFL #SportSphere HQ",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  const isHCPick = (p: Pick) => p.enhanced_signal === "HC" || p.edge_vol >= 0.90;

  const showPaywall = !proLoading && shouldShowProPrompt(isPro) && !paywallDismissed;
  const freePicks = filterPicksForTier(picks, false);
  const tieredPicks = (proLoading || isPro) ? picks : freePicks;

  const liveRoundStats = useMemo(() => {
    const picksWithResults = livePicksData.picks.filter(p => p.result)
    if (picksWithResults.length === 0) return null
    return calcRoundResults(picksWithResults)
  }, []);

  const filtered = (!proLoading && !isPro)
    ? tieredPicks
    : picks.filter((p: Pick) => {
        if (filter === "ACTIONABLE") return p.filter_pass;
        if (filter === "SHARP") return p.edge_vol >= 0.70 && p.edge_vol < 0.90 && !isHCPick(p);
        if (filter === "HC") return isHCPick(p);
        return true;
      });

  const hcCount = picks.filter(p => (p.edge_vol ?? 0) >= 0.90).length;
  const betCount = picks.filter((p: Pick) => p.filter_pass).length;
  const overCount = filtered.filter((p: Pick) => p.direction === "OVER").length;
  const underCount = filtered.filter((p: Pick) => p.direction === "UNDER").length;

  const generatedDate = new Date(generated_at).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      {/* Gradient header band */}
      <div style={{
        position: "fixed", top: 60, left: 0, right: 0, height: 120, zIndex: 0,
        background: "linear-gradient(180deg, #1a0a00 0%, #000000 100%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "84px 20px 60px" }}>
        <RoundCompleteBanner />
        <RoundStatusBanner />
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

        {showPaywall && (
          <FreeTierPaywall
            totalPicksAvailable={picks.length}
            totalHCPicksAvailable={picks.filter(p => isHCPick(p)).length}
            freePicks={freePicks}
            onDismiss={() => setPaywallDismissed(true)}
          />
        )}
        {showPaywall && <FreeTierPnLCard />}

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

        {/* SHARP picks section */}
        {(() => {
          const sharpPicks = picks.filter((p: Pick) => p.edge_vol >= 0.70 && p.edge_vol < 0.90 && !isHCPick(p) && p.filter_pass);
          if (sharpPicks.length === 0) return null;
          return (
            <div style={{
              background: "#0a0800", border: "1px solid #a16207",
              borderRadius: 10, padding: "14px 16px", marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, color: "#000",
                  background: "#facc15", padding: "2px 8px",
                  borderRadius: 4, letterSpacing: "0.08em",
                }}>⚡ SHARP</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>
                  Sharp picks this round
                </span>
                <span style={{ fontSize: 10, color: "#78350f", marginLeft: "auto" }}>
                  E/V 0.70+ · 69% historical win rate
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sharpPicks.map((p: Pick) => (
                  <div key={p.player} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                    background: "#080600", borderRadius: 6, padding: "10px 12px",
                    border: "1px solid #3d2800",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PlayerAvatar name={p.player} team={p.team} size={36} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.player}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#aaaaaa" }}>
                          {p.team} vs {p.opponent} · {p.venue} · {p.position}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>Direction</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: p.direction === "OVER" ? "#22c55e" : "#ef4444" }}>
                          {p.direction} {p.direction === "OVER" ? "⬆" : "⬇"} {p.bookie_line}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>E/V</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#facc15" }}>{p.edge_vol.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
            {(["CARD", "TABLE", "GAME"] as ViewType[]).map(v => (
              <button key={v} onClick={() => { setView(v); if (v !== "GAME") setMultiSelected([]); }} style={{
                padding: "6px 12px", borderRadius: 6,
                border: view === v ? "1px solid #f97316" : "1px solid #111",
                background: view === v ? "#f9731615" : "#0a0a0a",
                color: view === v ? "#f97316" : "#666",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>{v === "GAME" ? "BY GAME" : v}</button>
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

        {/* BY GAME VIEW */}
        {view === "GAME" && (() => {
          // Group filtered picks by game key
          const groups: Record<string, { fixture: Fixture | null; picks: Pick[] }> = {};
          for (const p of filtered) {
            const key = gameKey(p.team, p.opponent);
            if (!groups[key]) {
              groups[key] = { fixture: findFixture(p, fixtures as Fixture[]), picks: [] };
            }
            groups[key].picks.push(p);
          }
          const sortedGroups = Object.entries(groups).sort(([, a], [, b]) => {
            if (a.fixture && b.fixture) return fixtureSort(a.fixture, b.fixture);
            if (a.fixture) return -1;
            if (b.fixture) return 1;
            return 0;
          });

          if (sortedGroups.length === 0) return (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>No picks match this filter.</div>
              <button onClick={() => setFilter("ALL")} style={{ fontSize: 12, color: "#f97316", background: "none", border: "1px solid #f9731640", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
                Clear filter →
              </button>
            </div>
          );

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedGroups.map(([key, group]) => {
                const { fixture, picks: gPicks } = group;
                const gamePicks_sorted = [...gPicks].sort((a, b) => b.edge_vol - a.edge_vol);
                const homeTeam = fixture?.home ?? gPicks[0].team;
                const awayTeam = fixture?.away ?? gPicks[0].opponent;
                const gameMultiSelected = multiSelected.filter(n => gPicks.some(p => p.player === n));

                return (
                  <div key={key} style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
                    {/* Game header */}
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>
                          {homeTeam} vs {awayTeam}
                        </div>
                        {fixture && (
                          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                            {fixture.venue} · {fixture.day} {fixture.time}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#555" }}>{gPicks.length} pick{gPicks.length !== 1 ? "s" : ""}</span>
                        <button
                          onClick={() => {
                            const allInGame = gPicks.map(p => p.player);
                            const allSelected = allInGame.every(n => multiSelected.includes(n));
                            if (allSelected) {
                              setMultiSelected(prev => prev.filter(n => !allInGame.includes(n)));
                            } else {
                              setMultiSelected(prev => [...new Set([...prev, ...allInGame])]);
                            }
                          }}
                          style={{
                            fontSize: 10, fontWeight: 700, cursor: "pointer",
                            background: gameMultiSelected.length > 0 ? "#f9731620" : "#0a0a0a",
                            border: gameMultiSelected.length > 0 ? "1px solid #f9731640" : "1px solid #1a1a1a",
                            borderRadius: 5, padding: "4px 10px",
                            color: gameMultiSelected.length > 0 ? "#f97316" : "#555",
                          }}
                        >
                          {gameMultiSelected.length > 0 ? `Multi (${gameMultiSelected.length})` : "Multi Builder"}
                        </button>
                      </div>
                    </div>
                    {/* Picks list for this game */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {gamePicks_sorted.map((pred, idx) => {
                        const isSelected = multiSelected.includes(pred.player);
                        const isHCp = isHCPick(pred);
                        return (
                          <div key={pred.player} style={{
                            padding: "12px 16px",
                            borderBottom: idx < gamePicks_sorted.length - 1 ? "1px solid #0d0d0d" : "none",
                            background: isSelected ? "rgba(249,115,22,0.06)" : isHCp ? "rgba(249,115,22,0.03)" : "transparent",
                            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                            cursor: "pointer",
                          }}
                            onClick={() => toggleMulti(pred.player)}
                          >
                            {/* Checkbox */}
                            <div style={{
                              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                              border: isSelected ? "2px solid #f97316" : "2px solid #333",
                              background: isSelected ? "#f97316" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {isSelected && <span style={{ color: "#000", fontSize: 11, fontWeight: 800 }}>✓</span>}
                            </div>
                            <PlayerAvatar name={pred.player} team={pred.team} size={36} />
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{pred.player}</div>
                              <div style={{ fontSize: 11, color: "#666" }}>{pred.position} · {pred.team}</div>
                            </div>
                            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>Line</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>{pred.bookie_line}</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>E/V</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>{pred.edge_vol.toFixed(2)}</div>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: pred.direction === "OVER" ? "#22c55e" : "#ef4444" }}>
                                {pred.direction} {pred.direction === "OVER" ? "⬆" : "⬇"}
                              </div>
                              {isHCp && <span style={{ fontSize: 9, fontWeight: 800, color: "#000", background: "#f97316", borderRadius: 3, padding: "2px 6px" }}>HC</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* CARD VIEW — grouped by game time */}
        {view === "CARD" && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>No picks match this filter.</div>
            <button onClick={() => setFilter("ALL")} style={{ fontSize: 12, color: "#f97316", background: "none", border: "1px solid #f9731640", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
              Clear filter →
            </button>
          </div>
        )}

        {view === "CARD" && (() => {
          // Build game groups sorted by fixture time
          const gameGroups: Record<string, { fixture: Fixture | null; picks: Pick[] }> = {};
          for (const p of filtered) {
            const key = gameKey(p.team, p.opponent);
            if (!gameGroups[key]) {
              gameGroups[key] = { fixture: findFixture(p, fixtures as Fixture[]), picks: [] };
            }
            gameGroups[key].picks.push(p);
          }
          const sortedGameGroups = Object.entries(gameGroups).sort(([, a], [, b]) => {
            if (a.fixture && b.fixture) return fixtureSort(a.fixture, b.fixture);
            if (a.fixture) return -1;
            if (b.fixture) return 1;
            return 0;
          });

          return (
          <div className="picks-card-view" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {sortedGameGroups.map(([key, group]) => {
              const { fixture, picks: gPicks } = group;
              const sortedGPicks = [...gPicks].sort((a, b) => b.edge_vol - a.edge_vol);

              const dayAbbr = fixture ? fixture.day.slice(0, 3).toUpperCase() : null;
              const dividerText = fixture
                ? `${dayAbbr} ${fixture.time} · ${fixture.home} vs ${fixture.away} · ${fixture.venue}`
                : `${gPicks[0].team} vs ${gPicks[0].opponent}`;

              return (
                <div key={key} style={{ marginBottom: 20 }}>
                  {/* Game divider */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 10, color: "#444",
                  }}>
                    <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#555", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      {dividerText}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
                  </div>

                  {/* Picks for this game */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedGPicks.map((pred: Pick) => {
              const isHC = isHCPick(pred);
              const isBet = pred.enhanced_signal === "BET";
              const isOver = pred.direction === "OVER";
              const isExpanded = expanded === pred.player;

              return (
                <div
                  key={pred.player}
                  onClick={() => setExpanded(isExpanded ? null : pred.player)}
                  className="pick-card"
                  style={{
                    background: isHC ? "rgba(249,115,22,0.05)" : "#080808",
                    border: isHC ? "1px solid rgba(249,115,22,0.20)" : "1px solid #111",
                    backdropFilter: isHC ? "blur(10px)" : "none",
                    borderRadius: 10,
                    padding: "16px 20px",
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
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{pred.player}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#aaaaaa", marginBottom: 1 }}>
                        {pred.team} vs {pred.opponent}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#aaaaaa", letterSpacing: "0.02em" }}>
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
                      {pred.suppression_score && (() => {
                        const s = pred.suppression_score as SuppressionScore;
                        const isBoost = s.level === "BOOST";
                        return (
                          <div style={{
                            display: "inline-block", marginTop: 3, marginLeft: 4,
                            fontSize: 9, fontWeight: 700,
                            color: isBoost ? "#4ade80" : s.level === "STRONG" ? "#f87171" : "#fb923c",
                            background: isBoost ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                            border: `1px solid ${isBoost ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                            padding: "1px 6px", borderRadius: 3, letterSpacing: "0.05em",
                          }}>
                            {isBoost ? "BOOSTED" : `SUPPRESSED${s.level === "STRONG" ? " (STRONG)" : ""}`}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Numbers */}
                    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" }}>Line</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f0" }}>{pred.bookie_line}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" }}>Model</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#f97316" }}>{pred.predicted}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" }}>Edge</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: pred.edge > 0 ? "#22c55e" : "#ef4444" }}>
                          {pred.edge > 0 ? "+" : ""}{pred.edge}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" }}>
                          E/V
                          <Tooltip text="Edge/Vol = Edge ÷ Std Dev. Measures statistical significance. ≥ 0.50 = actionable, ≥ 0.90 = HIGH CONVICTION." />
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>{pred.edge_vol.toFixed(2)}</div>
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
                      {/* Suppression alert */}
                      {pred.suppression_score && (pred.suppression_score as SuppressionScore).level !== "BOOST" && (() => {
                        const s = pred.suppression_score as SuppressionScore;
                        const isStrong = s.level === "STRONG";
                        return (
                          <div style={{
                            background: isStrong ? "rgba(127,29,29,0.35)" : "rgba(28,10,0,0.4)",
                            border: `1px solid ${isStrong ? "#7f1d1d" : "#78350f"}`,
                            borderRadius: 6, padding: "10px 14px", marginBottom: 10,
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: isStrong ? "#f87171" : "#fb923c", marginBottom: 4 }}>
                              {isStrong ? "STRONG SUPPRESSION ALERT" : "MODERATE SUPPRESSION"} — Historically underperforms this opponent
                            </div>
                            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                              {pred.player} averages {s.recent_avg} disposals (recent) but only {s.h2h_avg} vs {pred.opponent} ({s.pct.toFixed(1)}% below form). The line of {pred.bookie_line} may be priced off recent form — exercise caution on OVER direction.
                            </div>
                          </div>
                        );
                      })()}
                      {pred.suppression_score && (pred.suppression_score as SuppressionScore).level === "BOOST" && (() => {
                        const s = pred.suppression_score as SuppressionScore;
                        return (
                          <div style={{
                            background: "rgba(5,46,22,0.35)", border: "1px solid #14532d",
                            borderRadius: 6, padding: "10px 14px", marginBottom: 10,
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>
                              BOOST DETECTED — Historically elevated vs this opponent
                            </div>
                            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                              {pred.player} averages {s.h2h_avg} disposals vs {pred.opponent} — {Math.abs(s.pct).toFixed(1)}% above recent form ({s.recent_avg} avg). Favourable historical matchup.
                            </div>
                          </div>
                        );
                      })()}

                      {/* Opponent factor text */}
                      <div style={{
                        background: "#050505", border: "1px solid #111",
                        borderRadius: 6, padding: "8px 12px", marginBottom: 10,
                        fontSize: 12, lineHeight: 1.6,
                      }}>
                        <OppFactorText {...pred} />
                      </div>

                      {/* H2H vs opponent */}
                      {pred.h2h_vs_opponent && pred.h2h_vs_opponent.length > 0 && (
                        <div style={{
                          background: "#050505", border: "1px solid #1a1a1a",
                          borderRadius: 6, padding: "10px 12px", marginBottom: 10,
                        }}>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                            H2H vs {pred.opponent} ({pred.h2h_sample} meetings)
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                            {pred.h2h_vs_opponent.slice(-6).map((g, idx) => {
                              const aboveLine = g.disposals > pred.bookie_line;
                              return (
                                <div key={idx} style={{
                                  background: aboveLine ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                  border: `1px solid ${aboveLine ? "#14532d" : "#450a0a"}`,
                                  borderRadius: 5, padding: "5px 9px", textAlign: "center",
                                }}>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: aboveLine ? "#4ade80" : "#f87171" }}>
                                    {g.disposals}
                                  </div>
                                  <div style={{ fontSize: 9, color: "#555" }}>
                                    {g.season} R{g.round?.replace(/\D/g, "")}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 11, color: "#888" }}>
                            Avg vs {pred.opponent}:{" "}
                            <strong style={{ color: pred.h2h_vs_line === "OVER" ? "#4ade80" : pred.h2h_vs_line === "UNDER" ? "#f87171" : "#888" }}>
                              {pred.h2h_avg}
                            </strong>
                            {" "}vs line {pred.bookie_line}
                            {pred.h2h_vs_line === "OVER" && (
                              <span style={{ color: "#4ade80", marginLeft: 8 }}>
                                ✓ Avg above current line ({pred.h2h_sample ?? 0} meetings)
                              </span>
                            )}
                            {pred.h2h_vs_line === "UNDER" && (
                              <span style={{ color: "#f87171", marginLeft: 8 }}>✗ Avg below current line</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recent form */}
                      {pred.recent_form && pred.recent_form.length > 0 && (
                        <div style={{
                          background: "#050505", border: "1px solid #1a1a1a",
                          borderRadius: 6, padding: "10px 12px", marginBottom: 10,
                        }}>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                            Recent form (last {pred.recent_form.length} games)
                          </div>
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            {pred.recent_form.map((d, idx) => {
                              const aboveLine = d > pred.bookie_line;
                              return (
                                <div key={idx} style={{
                                  background: aboveLine ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                                  border: `1px solid ${aboveLine ? "#14532d40" : "#450a0a40"}`,
                                  borderRadius: 4, padding: "4px 8px",
                                  fontSize: 13, fontWeight: 700,
                                  color: aboveLine ? "#4ade80" : "#f87171",
                                }}>
                                  {d}
                                </div>
                              );
                            })}
                            {pred.recent_avg != null && (
                              <span style={{ fontSize: 11, color: "#555", marginLeft: 6 }}>
                                avg {pred.recent_avg}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Venue alert */}
                      {VENUE_ALERTS[pred.venue] && (() => {
                        const alert = VENUE_ALERTS[pred.venue];
                        const borderColor = alert.level === "good" ? "#14532d" : alert.level === "warn" ? "#7f1d1d" : alert.level === "info" ? "#1e3a5f" : "#78350f";
                        const bgColor = alert.level === "good" ? "rgba(5,46,22,0.5)" : alert.level === "warn" ? "rgba(69,10,10,0.5)" : alert.level === "info" ? "rgba(14,30,60,0.5)" : "rgba(28,14,0,0.5)";
                        const textColor = alert.level === "good" ? "#4ade80" : alert.level === "warn" ? "#f87171" : alert.level === "info" ? "#60a5fa" : "#fb923c";
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

                      {/* Line tracker */}
                      {pred.line_at_publish != null && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8,
                          marginBottom: 10, padding: "7px 12px",
                          background: "#050505", border: "1px solid #111", borderRadius: 6,
                          fontSize: 11, color: "#555",
                        }}>
                          <span style={{ color: "#444" }}>📌 Line when published:</span>
                          <span style={{ color: "#888", fontWeight: 600 }}>{pred.line_at_publish}</span>
                          {pred.bookie_line !== pred.line_at_publish && (
                            <span style={{ color: pred.bookie_line > pred.line_at_publish ? "#22c55e" : "#ef4444", fontWeight: 700, marginLeft: 4 }}>
                              → {pred.bookie_line} {pred.bookie_line > pred.line_at_publish ? "↑ Sharp money aligned ✓" : "↓ Line moved against"}
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                        Model Breakdown
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
                        {[
                          { label: "2025 Avg", value: pred.avg_2025?.toFixed(1) ?? "—" },
                          { label: "2026 Avg", value: pred.avg_2026?.toFixed(1) ?? "—" },
                          { label: "Opp Factor", value: pred.opp_factor != null ? `×${pred.opp_factor.toFixed(3)}` : "—" },
                          { label: "Team Style", value: pred.team_style_index != null ? (pred.team_style_index > 0 ? `+${pred.team_style_index}` : pred.team_style_index.toString()) : "—" },
                          { label: "CBA%", value: pred.cba_pct != null ? `${(pred.cba_pct * 100).toFixed(0)}%` : "—" },
                          { label: "Condition", value: pred.condition },
                          { label: "Play Style", value: pred.play_style ?? "—" },
                          { label: "Volatility", value: pred.volatility_tier ?? "—" },
                          { label: "Std Dev", value: pred.std_dev?.toFixed(1) ?? "—" },
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
                </div>
              );
            })}
          </div>
          );
        })()}

        {/* Live round results summary */}
        {liveRoundStats && (
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid #111" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Live Results
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
              Round {livePicksData.round} Results
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "Total Picks", value: liveRoundStats.totalBets, color: "#f0f0f0" },
                { label: "Win Rate", value: `${(liveRoundStats.winRate * 100).toFixed(1)}%`, color: "#4ade80" },
                { label: "Profit", value: `$${liveRoundStats.totalProfit.toLocaleString()}`, color: liveRoundStats.totalProfit >= 0 ? "#4ade80" : "#ef4444" },
                { label: "ROI", value: `${liveRoundStats.roi.toFixed(1)}%`, color: liveRoundStats.roi >= 0 ? "#4ade80" : "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "#0a0a0a", border: "1px solid #111",
                  borderRadius: 10, padding: "16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#555", lineHeight: 1.8 }}>
            Analytics only · Not financial advice · Edge/Vol ≥ 0.50 filter applied · FWDs excluded from bet filter
          </p>
        </div>
      </div>

      {/* Multi Builder floating tray */}
      {multiSelected.length > 0 && (
        <div style={{
          position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 500, background: "#0d0d0d", border: "1px solid #f9731640",
          borderRadius: 12, padding: "14px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          minWidth: 340, maxWidth: "90vw",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Multi Builder
            </span>
            <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>
              {multiSelected.length} leg{multiSelected.length !== 1 ? "s" : ""} · $1.87 each
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            {multiSelected.map(name => {
              const p = picks.find(pk => pk.player === name);
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#f0f0f0" }}>
                  <span style={{ color: p?.direction === "OVER" ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                    {p?.direction === "OVER" ? "⬆" : "⬇"}
                  </span>
                  <span style={{ flex: 1 }}>{name}</span>
                  <span style={{ color: "#888" }}>{p?.direction} {p?.bookie_line}</span>
                  <button onClick={() => toggleMulti(name)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 13, padding: "0 2px" }}>×</button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#f97316" }}>
              Combined: ${calcCombinedOdds(multiSelected.length)}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={copyMulti}
                style={{
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: multiCopied ? "#052e16" : "#f97316",
                  border: "none", borderRadius: 6, padding: "6px 14px",
                  color: multiCopied ? "#4ade80" : "#000",
                }}
              >
                {multiCopied ? "✓ Copied" : "Copy to clipboard"}
              </button>
              <button
                onClick={() => setMultiSelected([])}
                style={{ fontSize: 11, cursor: "pointer", background: "none", border: "1px solid #333", borderRadius: 6, padding: "6px 10px", color: "#555" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
