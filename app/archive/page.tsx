"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

interface ArchivePick {
  id: string;
  round: number;
  player_name: string;
  team: string;
  position: string;
  line: number;
  prediction: string;
  edge_vol: number;
  tier: string;
  odds: number;
  final_disposals: number | null;
  result: string | null;
  profit_loss: number | null;
}

interface RoundGroup {
  round: number;
  picks: ArchivePick[];
  wins: number;
  losses: number;
  pending: number;
  netPL: number;
}

export default function ArchivePage() {
  const { isPro, loading: proLoading } = useProAccess();
  const [rounds, setRounds] = useState<RoundGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [filterPos, setFilterPos] = useState<string>("ALL");

  useEffect(() => {
    if (proLoading || !isPro) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    supabase
      .from("live_picks")
      .select("*")
      .eq("tier", "HC")
      .order("round", { ascending: false })
      .order("edge_vol", { ascending: false })
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }

        const grouped: Record<number, ArchivePick[]> = {};
        for (const pick of data) {
          if (!grouped[pick.round]) grouped[pick.round] = [];
          grouped[pick.round].push(pick);
        }

        const roundGroups: RoundGroup[] = Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([round, picks]) => {
            const wins = picks.filter(p => p.result === "WIN").length;
            const losses = picks.filter(p => p.result === "LOSS").length;
            const pending = picks.filter(p => !p.result).length;
            const netPL = picks.reduce((sum, p) => sum + (p.profit_loss ?? 0), 0);
            return { round: Number(round), picks, wins, losses, pending, netPL };
          });

        setRounds(roundGroups);
        if (roundGroups.length > 0) setExpandedRound(roundGroups[0].round);
        setLoading(false);
      });
  }, [isPro, proLoading]);

  if (!proLoading && !isPro) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Pro Only</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Picks Archive</h1>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 32px" }}>
            Access every HC pick from every tracked round — with results, P&L, and filtering by position.
          </p>
          <Link href="/auth/payment" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Unlock Pro — $29/month →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const POSITIONS = ["ALL", "MID", "DEF", "FWD", "RUCK"];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Pro · All Seasons
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            HC Picks Archive
          </h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0 }}>
            Every High Conviction pick, every round. {rounds.reduce((t, r) => t + r.picks.length, 0)} picks across {rounds.length} rounds.
          </p>
        </div>

        {/* Position filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setFilterPos(pos)}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                border: "1px solid",
                borderColor: filterPos === pos ? "#f97316" : "#1a1a1a",
                background: filterPos === pos ? "#f9731618" : "transparent",
                color: filterPos === pos ? "#f97316" : "#555",
                cursor: "pointer",
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>Loading archive…</div>
        ) : rounds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>No picks found in the archive yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rounds.map(rg => {
              const filteredPicks = filterPos === "ALL" ? rg.picks : rg.picks.filter(p => p.position === filterPos);
              const isExpanded = expandedRound === rg.round;
              const filtWins = filteredPicks.filter(p => p.result === "WIN").length;
              const filtLosses = filteredPicks.filter(p => p.result === "LOSS").length;

              return (
                <div key={rg.round} style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                  <button
                    onClick={() => setExpandedRound(isExpanded ? null : rg.round)}
                    style={{
                      width: "100%", background: isExpanded ? "#080808" : "#050505",
                      border: "none", cursor: "pointer", padding: "16px 20px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Round {rg.round}</span>
                      <span style={{ fontSize: 12, color: "#555" }}>{rg.picks.length} HC picks</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {rg.wins + rg.losses > 0 && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: rg.wins / (rg.wins + rg.losses) >= 0.65 ? "#22c55e" : "#f97316" }}>
                          {((rg.wins / (rg.wins + rg.losses)) * 100).toFixed(0)}%
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: rg.netPL >= 0 ? "#22c55e" : "#ef4444" }}>
                        {rg.netPL >= 0 ? "+" : ""}${Math.abs(Math.round(rg.netPL)).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, color: "#555" }}>{rg.wins}W · {rg.losses}L{rg.pending > 0 ? ` · ${rg.pending} pending` : ""}</span>
                      <span style={{ fontSize: 14, color: "#444" }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isExpanded && filteredPicks.length > 0 && (
                    <div style={{ background: "#030303", borderTop: "1px solid #0d0d0d" }}>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #0d0d0d" }}>
                              {["Player", "Team / Pos", "Pick", "E/V", "Result", "P&L"].map(h => (
                                <th key={h} style={{ padding: "10px 16px", fontSize: 10, color: "#555", fontWeight: 600, textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPicks.map((p, i) => (
                              <tr key={p.id} style={{ borderBottom: "1px solid #080808", opacity: filterPos !== "ALL" && p.position !== filterPos ? 0.3 : 1 }}>
                                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.player_name}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>{p.team} · {p.position}</td>
                                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: p.prediction === "OVER" ? "#22c55e" : "#ef4444" }}>
                                  {p.prediction} {p.line}
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: 12, color: "#60a5fa" }}>{p.edge_vol?.toFixed(2) ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: p.result === "WIN" ? "#4ade80" : p.result === "LOSS" ? "#f87171" : "#555" }}>
                                  {p.result ?? (p.final_disposals !== null ? `${p.final_disposals} disp` : "Pending")}
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: (p.profit_loss ?? 0) >= 0 ? "#4ade80" : "#f87171" }}>
                                  {p.profit_loss !== null ? `${p.profit_loss >= 0 ? "+" : ""}$${Math.abs(p.profit_loss).toLocaleString()}` : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ padding: "12px 16px", borderTop: "1px solid #0d0d0d", display: "flex", gap: 20, fontSize: 12, color: "#555" }}>
                        <span>Filtered: {filtWins}W · {filtLosses}L</span>
                        {filtWins + filtLosses > 0 && <span>Win rate: {((filtWins / (filtWins + filtLosses)) * 100).toFixed(0)}%</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
