"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getCurrentPredictions, getPlayers } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useProAccess } from "@/lib/auth";

const predictions = getCurrentPredictions();
const allPlayers = getPlayers();
const playerNames = allPlayers.map(p => p.name);
const playerTeamMap = Object.fromEntries(allPlayers.map(p => [p.name, p.team]));
const predictionMap = Object.fromEntries(predictions.picks.map(p => [p.player, p]));

interface Bet {
  id: string
  player: string
  team: string
  round: number
  line: number
  direction: "OVER" | "UNDER"
  stake: number
  odds: number
  result: "WIN" | "LOSS" | "PENDING"
  actual?: number
  date: string
}

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

function calcPL(bet: Bet): number {
  if (bet.result === "PENDING") return 0;
  if (bet.result === "WIN") return +(bet.stake * (bet.odds - 1)).toFixed(2);
  return -bet.stake;
}

function exportCSV(bets: Bet[]) {
  const headers = ["ID", "Player", "Team", "Round", "Line", "Direction", "Stake", "Odds", "Result", "Actual", "P/L", "Date"];
  const rows = bets.map(b => [
    b.id, b.player, b.team, b.round, b.line, b.direction,
    b.stake, b.odds, b.result, b.actual ?? "", calcPL(b), b.date,
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sportspherehq_bets_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TrackerPage() {
  const router = useRouter()
  useEffect(() => { router.push('/afl') }, [router])
  const { isPro, loading: proLoading } = useProAccess();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [bets, setBets] = useState<Bet[]>([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filterResult, setFilterResult] = useState<"ALL" | "WIN" | "LOSS" | "PENDING">("ALL");

  useEffect(() => {
    if (!supabase) { setUser(null); return; }
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [form, setForm] = useState({
    player: "",
    team: "",
    round: String(predictions.round),
    line: "",
    direction: "OVER" as "OVER" | "UNDER",
    stake: "",
    odds: "",
    result: "PENDING" as "WIN" | "LOSS" | "PENDING",
    actual: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("ss_bets");
    if (stored) setBets(JSON.parse(stored));
  }, []);

  function save(updated: Bet[]) {
    setBets(updated);
    localStorage.setItem("ss_bets", JSON.stringify(updated));
  }

  function handlePlayerInput(val: string) {
    setForm(f => ({ ...f, player: val }));
    if (val.length >= 2) {
      const matches = playerNames.filter(n => n.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }

  function selectPlayer(name: string) {
    const team = playerTeamMap[name] ?? "";
    const pick = predictionMap[name];
    setForm(f => ({
      ...f,
      player: name,
      team,
      line: pick ? String(pick.bookie_line) : f.line,
      direction: pick ? (pick.direction as "OVER" | "UNDER") : f.direction,
    }));
    setSuggestions([]);
  }

  function addBet() {
    if (!form.player || !form.line || !form.stake || !form.odds) return;
    const bet: Bet = {
      id: newId(),
      player: form.player,
      team: form.team || playerTeamMap[form.player] || "",
      round: Number(form.round),
      line: Number(form.line),
      direction: form.direction,
      stake: Number(form.stake),
      odds: Number(form.odds),
      result: form.result,
      actual: form.actual ? Number(form.actual) : undefined,
      date: new Date().toISOString().slice(0, 10),
    };
    save([bet, ...bets]);
    setForm(f => ({ ...f, player: "", team: "", line: "", stake: "", odds: "", actual: "", result: "PENDING" }));
  }

  function updateResult(id: string, result: "WIN" | "LOSS" | "PENDING") {
    save(bets.map(b => b.id === id ? { ...b, result } : b));
  }

  function removeBet(id: string) {
    save(bets.filter(b => b.id !== id));
  }

  const filtered = bets.filter(b => {
    if (filterResult !== "ALL" && b.result !== filterResult) return false;
    if (search && !b.player.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = useMemo(() => {
    const settled = bets.filter(b => b.result !== "PENDING");
    const wins = settled.filter(b => b.result === "WIN");
    const totalStake = settled.reduce((s, b) => s + b.stake, 0);
    const totalPL = settled.reduce((s, b) => s + calcPL(b), 0);
    return {
      total: bets.length,
      wins: wins.length,
      losses: settled.length - wins.length,
      pending: bets.filter(b => b.result === "PENDING").length,
      winRate: settled.length ? Math.round(wins.length / settled.length * 1000) / 10 : 0,
      totalPL: +totalPL.toFixed(2),
      roi: totalStake ? +((totalPL / totalStake) * 100).toFixed(1) : 0,
    };
  }, [bets]);

  if (proLoading) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "160px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#555" }}>Loading...</div>
      </div>
      <Footer />
    </div>
  );

  if (!isPro) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "140px 20px 60px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
          Pro Feature
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
          Tracker - Pro Only
        </h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 32, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          Log bets, track results, and monitor P&L. Full bet tracking and CSV export included with Pro.
        </p>
        <a href="/auth/signup" style={{
          display: "inline-block",
          background: "#f97316", color: "#000",
          padding: "14px 32px", borderRadius: 8,
          fontSize: 15, fontWeight: 700, textDecoration: "none",
          marginBottom: 12,
        }}>
          Upgrade to Pro - $29/month
        </a>
        <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
          Cancel anytime. No lock-in.
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative" }}>
      <Nav />

      {/* Auth gate - blur overlay when not signed in */}
      {user === null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          backdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#080808", border: "1px solid #1f1f1f",
            borderRadius: 16, padding: "40px 36px", maxWidth: 380, textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Tracker</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Sign in to save your picks</h2>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 24 }}>
              The tracker saves your bets locally and syncs across sessions when signed in. Free forever.
            </p>
            <Link href="/signup" style={{
              display: "block", padding: "12px", marginBottom: 10,
              background: "#f97316", color: "#000", borderRadius: 8,
              fontSize: 14, fontWeight: 700, textDecoration: "none",
            }}>
              Create free account →
            </Link>
            <Link href="/login" style={{
              display: "block", padding: "10px",
              background: "none", color: "#666", border: "1px solid #1f1f1f", borderRadius: 8,
              fontSize: 13, textDecoration: "none",
            }}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Personal tracker
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Bet Tracker
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            Log your bets, track results, and monitor P&L. Stored locally - no account needed.
          </p>
        </div>

        {/* Dashboard */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 28 }}>
          {[
            { label: "Total Bets", value: stats.total, color: "#f0f0f0" },
            { label: "Win Rate", value: `${stats.winRate}%`, color: stats.winRate >= 55 ? "#22c55e" : "#f97316" },
            { label: "Total P&L", value: `${stats.totalPL >= 0 ? "+" : ""}$${stats.totalPL}`, color: stats.totalPL >= 0 ? "#22c55e" : "#ef4444" },
            { label: "ROI", value: `${stats.roi >= 0 ? "+" : ""}${stats.roi}%`, color: stats.roi >= 0 ? "#22c55e" : "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#0a0a0a", border: "1px solid #111",
              borderRadius: 10, padding: "16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add bet form */}
        <div style={{
          background: "#080808", border: "1px solid #1a1a1a",
          borderRadius: 12, padding: "20px 20px 16px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            Log a bet
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 10 }}>
            {/* Player autocomplete */}
            <div style={{ position: "relative", gridColumn: "span 2" }}>
              <input
                value={form.player}
                onChange={e => handlePlayerInput(e.target.value)}
                placeholder="Player name..."
                style={{
                  width: "100%", background: "#111", border: "1px solid #1a1a1a",
                  borderRadius: 6, padding: "8px 10px", fontSize: 12,
                  color: "#f0f0f0", boxSizing: "border-box",
                }}
              />
              {suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  background: "#111", border: "1px solid #1a1a1a", borderRadius: 6,
                  overflow: "hidden", marginTop: 2,
                }}>
                  {suggestions.map(name => (
                    <div key={name} onClick={() => selectPlayer(name)} style={{
                      padding: "8px 10px", fontSize: 12, color: "#888",
                      cursor: "pointer", borderBottom: "1px solid #0a0a0a",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <PlayerAvatar name={name} team={playerTeamMap[name] ?? ""} size={20} />
                      {name}
                      {predictionMap[name] && (
                        <span style={{ marginLeft: "auto", fontSize: 9, color: "#f97316", fontWeight: 700 }}>R{predictions.round}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {[
              { key: "round", placeholder: "Round", type: "number" },
              { key: "line", placeholder: "Line", type: "number" },
              { key: "stake", placeholder: "Stake $", type: "number" },
              { key: "odds", placeholder: "Odds (e.g. 1.90)", type: "number" },
              { key: "actual", placeholder: "Actual (opt.)", type: "number" },
            ].map(({ key, placeholder, type }) => (
              <input
                key={key}
                type={type}
                value={(form as Record<string, string>)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{
                  background: "#111", border: "1px solid #1a1a1a",
                  borderRadius: 6, padding: "8px 10px", fontSize: 12,
                  color: "#f0f0f0", width: "100%", boxSizing: "border-box",
                }}
              />
            ))}

            {/* Direction */}
            <select
              value={form.direction}
              onChange={e => setForm(f => ({ ...f, direction: e.target.value as "OVER" | "UNDER" }))}
              style={{
                background: "#111", border: "1px solid #1a1a1a",
                borderRadius: 6, padding: "8px 10px", fontSize: 12,
                color: form.direction === "OVER" ? "#22c55e" : "#ef4444",
              }}
            >
              <option value="OVER">OVER</option>
              <option value="UNDER">UNDER</option>
            </select>

            {/* Result */}
            <select
              value={form.result}
              onChange={e => setForm(f => ({ ...f, result: e.target.value as "WIN" | "LOSS" | "PENDING" }))}
              style={{
                background: "#111", border: "1px solid #1a1a1a",
                borderRadius: 6, padding: "8px 10px", fontSize: 12,
                color: form.result === "WIN" ? "#22c55e" : form.result === "LOSS" ? "#ef4444" : "#555",
              }}
            >
              <option value="PENDING">Pending</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
            </select>
          </div>

          <button
            onClick={addBet}
            style={{
              background: "#f97316", color: "#000",
              border: "none", borderRadius: 7,
              padding: "9px 20px", fontSize: 12,
              fontWeight: 700, cursor: "pointer",
            }}
          >
            + Add Bet
          </button>
        </div>

        {/* Filters + export */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by player..."
            style={{
              background: "#0a0a0a", border: "1px solid #111",
              borderRadius: 6, padding: "6px 10px", fontSize: 11,
              color: "#888", flex: 1, minWidth: 160,
            }}
          />
          {(["ALL", "WIN", "LOSS", "PENDING"] as const).map(r => (
            <button key={r} onClick={() => setFilterResult(r)} style={{
              padding: "5px 11px", borderRadius: 5,
              border: filterResult === r ? "1px solid #f97316" : "1px solid #111",
              background: filterResult === r ? "#f97316" : "#0a0a0a",
              color: filterResult === r ? "#000" : "#555",
              fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}>{r}</button>
          ))}
          <button
            onClick={() => exportCSV(bets)}
            disabled={bets.length === 0}
            style={{
              background: "#0a0a0a", border: "1px solid #111",
              borderRadius: 6, padding: "6px 12px", fontSize: 10,
              fontWeight: 700, color: "#555", cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            ↓ CSV
          </button>
        </div>

        {/* Bets table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#555", fontSize: 13 }}>
            {bets.length === 0 ? "No bets logged yet. Add your first bet above." : "No bets match your filters."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(bet => {
              const pl = calcPL(bet);
              return (
                <div key={bet.id} style={{
                  background: "#080808", border: "1px solid #111",
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                }}>
                  <PlayerAvatar name={bet.player} team={bet.team} size={32} />

                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{bet.player}</div>
                    <div style={{ fontSize: 10, color: "#666" }}>
                      R{bet.round} · {bet.direction} {bet.line} · {bet.date}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>Stake</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>${bet.stake}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>Odds</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{bet.odds}</div>
                    </div>
                    {bet.result !== "PENDING" && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>P&L</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: pl >= 0 ? "#22c55e" : "#ef4444" }}>
                          {pl >= 0 ? "+" : ""}${pl}
                        </div>
                      </div>
                    )}

                    {/* Result toggle */}
                    <div style={{ display: "flex", gap: 4 }}>
                      {(["PENDING", "WIN", "LOSS"] as const).map(r => (
                        <button key={r} onClick={e => { e.stopPropagation(); updateResult(bet.id, r); }} style={{
                          padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                          cursor: "pointer", border: bet.result === r
                            ? `1px solid ${r === "WIN" ? "#22c55e" : r === "LOSS" ? "#ef4444" : "#f97316"}`
                            : "1px solid #111",
                          background: bet.result === r
                            ? `${r === "WIN" ? "#22c55e" : r === "LOSS" ? "#ef4444" : "#f97316"}22`
                            : "transparent",
                          color: bet.result === r
                            ? (r === "WIN" ? "#22c55e" : r === "LOSS" ? "#ef4444" : "#f97316")
                            : "#555",
                        }}>{r}</button>
                      ))}
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); removeBet(bet.id); }}
                      style={{
                        background: "none", border: "none",
                        color: "#555", cursor: "pointer", fontSize: 14, padding: "0 4px",
                      }}
                    >×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          Data stored locally in your browser. Not synced across devices. For entertainment purposes. 18+ only. Gamble responsibly - 1800 858 858.
        </div>
      </div>

      <Footer />
    </div>
  );
}
