"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

interface RoundPreviewData {
  round: number;
  season: number;
  picks: {
    player_name: string;
    team: string;
    position: string;
    line: number;
    prediction: string;
    edge_vol: number;
    tier: string;
  }[];
  teamNews: {
    team: string;
    note: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
  }[];
}

function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    HIGH:   { bg: "#100303", color: "#f87171" },
    MEDIUM: { bg: "#1c0a00", color: "#f59e0b" },
    LOW:    { bg: "#080808", color: "#666" },
  };
  const c = colors[impact] ?? colors.LOW;
  return (
    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3, background: c.bg, color: c.color, letterSpacing: "0.06em" }}>
      {impact}
    </span>
  );
}

export default function RoundPreviewPage() {
  const { isPro, loading: proLoading } = useProAccess();
  const [preview, setPreview] = useState<RoundPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (proLoading || !isPro) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    Promise.all([
      supabase.from("rounds").select("*").eq("sport", "AFL").eq("season", 2026).eq("status", "active").single(),
      supabase.from("live_picks").select("*").eq("tier", "HC").order("edge_vol", { ascending: false }),
      supabase.from("team_news").select("*").order("created_at", { ascending: false }).limit(20),
    ]).then(([roundRes, picksRes, newsRes]) => {
      const round = roundRes.data;
      const picks = picksRes.data ?? [];
      const news = newsRes.data ?? [];

      if (round) {
        const currentPicks = picks.filter((p: { round: number }) => p.round === round.round_number);
        setPreview({
          round: round.round_number,
          season: round.season,
          picks: currentPicks,
          teamNews: news.map((n: { team: string; note?: string; impact?: string; player_out?: string }) => ({
            team: n.team,
            note: n.note ?? `${n.player_out} out`,
            impact: (n.impact ?? "LOW") as "HIGH" | "MEDIUM" | "LOW",
          })),
        });
      }
      setLoading(false);
    });
  }, [isPro, proLoading]);

  if (!proLoading && !isPro) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Pro Only</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Round Preview</h1>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 32px" }}>
            Pre-round analysis with team news, model confidence, and early signal breakdowns before picks go live.
          </p>
          <Link href="/auth/payment" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Unlock Pro — $29/month →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const byPosition = preview?.picks.reduce((acc: Record<string, typeof preview.picks>, p) => {
    const pos = p.position ?? "OTHER";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(p);
    return acc;
  }, {}) ?? {};

  const highEV = preview?.picks.filter(p => p.edge_vol >= 1.0) ?? [];
  const medEV = preview?.picks.filter(p => p.edge_vol >= 0.75 && p.edge_vol < 1.0) ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f9731618", border: "1px solid #f9731640", borderRadius: 20, padding: "5px 12px", marginBottom: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#f97316", letterSpacing: "0.08em" }}>PRO</span>
            <span style={{ fontSize: 11, color: "#f97316" }}>Early Access</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            {loading ? "Round Preview" : `Round ${preview?.round} Preview`}
          </h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0 }}>
            Model signals, team news, and pre-round analysis.
          </p>
        </div>

        {loading ? (
          <div style={{ color: "#444", padding: "60px 0", textAlign: "center" }}>Loading preview…</div>
        ) : !preview ? (
          <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#555", margin: 0 }}>No active round found. Check back when picks are seeded.</p>
          </div>
        ) : (
          <>
            {/* Signal summary */}
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "HC Signals", value: preview.picks.length, color: "#f97316" },
                  { label: "E/V ≥ 1.0", value: highEV.length, color: "#22c55e" },
                  { label: "Team News", value: preview.teamNews.filter(n => n.impact === "HIGH").length, sub: "high impact", color: preview.teamNews.some(n => n.impact === "HIGH") ? "#f59e0b" : "#666" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{s.label}</div>
                    {s.sub && <div style={{ fontSize: 10, color: "#444" }}>{s.sub}</div>}
                  </div>
                ))}
              </div>
            </section>

            {/* Top signals by E/V tier */}
            {highEV.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                  Elite Signals — E/V ≥ 1.0
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {highEV.map((p, i) => (
                    <div key={i} style={{ background: "#030f08", border: "1px solid #14532d", borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.player_name}</span>
                        <span style={{ fontSize: 12, color: "#4ade8099", marginLeft: 8 }}>{p.team} · {p.position}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: p.prediction === "OVER" ? "#22c55e" : "#ef4444" }}>
                          {p.prediction} {p.line}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>E/V {p.edge_vol.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All signals by position */}
            <section style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                All HC Signals by Position
              </div>
              {Object.entries(byPosition).map(([pos, picks]) => (
                <div key={pos} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{pos} ({picks.length})</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                      <tbody>
                        {picks.map((p, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #0a0a0a" }}>
                            <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.player_name}</td>
                            <td style={{ padding: "10px 12px", fontSize: 12, color: "#555" }}>{p.team}</td>
                            <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: p.prediction === "OVER" ? "#22c55e" : "#ef4444" }}>
                              {p.prediction} {p.line}
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: 12, color: "#60a5fa" }}>E/V {p.edge_vol.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>

            {/* Team news */}
            {preview.teamNews.length > 0 && (
              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                  Team News
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {preview.teamNews.map((n, i) => (
                    <div key={i} style={{ background: "#080808", border: "1px solid #111", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ImpactBadge impact={n.impact} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{n.team}</span>
                        <span style={{ fontSize: 13, color: "#f0f0f0" }}>{n.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
