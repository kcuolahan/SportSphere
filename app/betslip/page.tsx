"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

interface KellyResult {
  fraction: number;
  fullKelly: number;
  halfKelly: number;
  quarterKelly: number;
  edge: number;
  expectedValue: number;
}

function calcKelly(winProb: number, decimalOdds: number, bankroll: number): KellyResult {
  const b = decimalOdds - 1;
  const p = winProb / 100;
  const q = 1 - p;
  const fraction = Math.max(0, (b * p - q) / b);
  const edge = (b * p - q) * 100;

  return {
    fraction,
    fullKelly: Math.round(bankroll * fraction),
    halfKelly: Math.round(bankroll * fraction * 0.5),
    quarterKelly: Math.round(bankroll * fraction * 0.25),
    edge: Math.round(edge * 100) / 100,
    expectedValue: Math.round((b * p - q) * 1000) / 10,
  };
}

interface BetRow {
  id: number;
  player: string;
  winProb: number;
  odds: number;
  stake: number;
}

export default function BetslipPage() {
  const { isPro, loading: proLoading } = useProAccess();
  const [bankroll, setBankroll] = useState(10000);
  const [winProb, setWinProb] = useState(67.6);
  const [odds, setOdds] = useState(1.87);
  const [bets, setBets] = useState<BetRow[]>([
    { id: 1, player: "", winProb: 67.6, odds: 1.87, stake: 0 },
  ]);
  const [kellyMode, setKellyMode] = useState<"half" | "quarter" | "full">("half");

  if (!proLoading && !isPro) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Pro Only</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Kelly Criterion Calculator</h1>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 32px" }}>
            Optimal stake sizing using Kelly Criterion. Input your win probability and odds to get full, half, and quarter Kelly recommendations.
          </p>
          <Link href="/auth/payment" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Unlock Pro — $29/month →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const kelly = calcKelly(winProb, odds, bankroll);
  const impliedProb = Math.round((1 / odds) * 1000) / 10;

  const addBet = () => setBets(prev => [...prev, { id: Date.now(), player: "", winProb: 67.6, odds: 1.87, stake: 0 }]);
  const removeBet = (id: number) => setBets(prev => prev.filter(b => b.id !== id));
  const updateBet = (id: number, field: keyof BetRow, value: string | number) =>
    setBets(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));

  function fillKelly(id: number) {
    const bet = bets.find(b => b.id === id);
    if (!bet) return;
    const k = calcKelly(bet.winProb, bet.odds, bankroll);
    const stake = kellyMode === "full" ? k.fullKelly : kellyMode === "half" ? k.halfKelly : k.quarterKelly;
    updateBet(id, "stake", stake);
  }

  function fillAllKelly() {
    setBets(prev => prev.map(bet => {
      const k = calcKelly(bet.winProb, bet.odds, bankroll);
      const stake = kellyMode === "full" ? k.fullKelly : kellyMode === "half" ? k.halfKelly : k.quarterKelly;
      return { ...bet, stake };
    }));
  }

  function downloadBetslip() {
    const lines = [
      `SportSphere HQ — Betslip Export`,
      `Bankroll: $${bankroll.toLocaleString()}`,
      `Kelly mode: ${kellyMode}`,
      ``,
      `Player / Pick\tWin %\tOdds\tStake ($)\tEV`,
      ...bets.map(bet => {
        const k = calcKelly(bet.winProb, bet.odds, bankroll);
        const ev = k.expectedValue * bet.stake / 100;
        return `${bet.player || "—"}\t${bet.winProb}%\t${bet.odds}\t$${bet.stake}\t${ev >= 0 ? "+" : ""}$${Math.round(ev)}`;
      }),
      ``,
      `Total Stake: $${totalStake.toLocaleString()}`,
      `Total EV: ${totalEV >= 0 ? "+" : ""}$${Math.round(totalEV)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sportspherehq-betslip.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalStake = bets.reduce((s, b) => s + (b.stake || 0), 0);
  const totalEV = bets.reduce((s, b) => {
    const k = calcKelly(b.winProb, b.odds, bankroll);
    return s + k.expectedValue * (b.stake || 0) / 100;
  }, 0);

  const parlayOdds = bets.reduce((p, b) => p * b.odds, 1);
  const parlayWinProb = bets.reduce((p, b) => p * (b.winProb / 100), 1) * 100;
  const parlayEdge = ((parlayOdds - 1) * (parlayWinProb / 100) - (1 - parlayWinProb / 100)) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "84px 20px 60px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Pro Tool</div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Kelly Criterion Betslip</h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Optimal stake sizing based on your edge and bankroll.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

          {/* Calculator */}
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Single Bet Calculator</div>

            {[
              { label: "Bankroll ($)", value: bankroll, setter: setBankroll, min: 100, max: 1000000, step: 100 },
              { label: `Win Probability (%) — Book implies ${impliedProb}%`, value: winProb, setter: setWinProb, min: 1, max: 99, step: 0.1 },
              { label: "Decimal Odds", value: odds, setter: setOdds, min: 1.01, max: 20, step: 0.01 },
            ].map(({ label, value, setter, min, max, step }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  type="number"
                  value={value}
                  min={min} max={max} step={step}
                  onChange={e => setter(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 6, color: "#f0f0f0", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Recommendation</div>

            <div style={{
              background: kelly.edge > 0 ? "#030f08" : "#100a08",
              border: `1px solid ${kelly.edge > 0 ? "#14532d" : "#78350f"}`,
              borderRadius: 8, padding: "16px", marginBottom: 20, textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: kelly.edge > 0 ? "#4ade80" : "#f59e0b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                {kelly.edge > 0 ? "Positive Edge" : "Negative Edge — Avoid"}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: kelly.edge > 0 ? "#22c55e" : "#ef4444", letterSpacing: "-0.02em" }}>
                {kelly.edge > 0 ? "+" : ""}{kelly.edge}%
              </div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Expected value per $100 staked</div>
            </div>

            {[
              { label: "Full Kelly", amount: kelly.fullKelly, pct: Math.round(kelly.fraction * 1000) / 10, color: "#f97316" },
              { label: "Half Kelly (recommended)", amount: kelly.halfKelly, pct: Math.round(kelly.fraction * 500) / 10, color: "#22c55e" },
              { label: "Quarter Kelly (conservative)", amount: kelly.quarterKelly, pct: Math.round(kelly.fraction * 250) / 10, color: "#60a5fa" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0d0d0d" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#888" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>{r.pct}% of bankroll</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: kelly.edge > 0 ? r.color : "#555" }}>
                  ${kelly.edge > 0 ? r.amount.toLocaleString() : "0"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-bet builder */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Betslip Builder</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {/* Kelly mode selector */}
              <div style={{ display: "flex", background: "#111", borderRadius: 6, border: "1px solid #1a1a1a", overflow: "hidden" }}>
                {(["quarter", "half", "full"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setKellyMode(mode)}
                    style={{ padding: "5px 10px", background: kellyMode === mode ? "#f97316" : "transparent", border: "none", color: kellyMode === mode ? "#000" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}
                  >
                    {mode === "half" ? "½" : mode === "quarter" ? "¼" : "1"} Kelly
                  </button>
                ))}
              </div>
              <button
                onClick={fillAllKelly}
                style={{ padding: "5px 12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#f0f0f0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                Fill All
              </button>
              <button
                onClick={addBet}
                style={{ padding: "5px 12px", background: "#f9731618", border: "1px solid #f9731640", borderRadius: 6, color: "#f97316", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                + Add Bet
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  {["Player / Pick", "Win %", "Odds", "Kelly Stake", "Stake ($)", "EV", ""].map(h => (
                    <th key={h} style={{ padding: "8px 10px", fontSize: 10, color: "#555", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bets.map(bet => {
                  const betKelly = calcKelly(bet.winProb, bet.odds, bankroll);
                  const suggestedStake = kellyMode === "full" ? betKelly.fullKelly : kellyMode === "half" ? betKelly.halfKelly : betKelly.quarterKelly;
                  const betEV = betKelly.expectedValue * (bet.stake || 0) / 100;
                  return (
                    <tr key={bet.id} style={{ borderTop: "1px solid #0d0d0d" }}>
                      <td style={{ padding: "7px 10px" }}>
                        <input
                          value={bet.player}
                          onChange={e => updateBet(bet.id, "player", e.target.value)}
                          placeholder="Player · Line"
                          style={{ width: "100%", padding: "6px 8px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, color: "#f0f0f0", fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <input
                          type="number" min={1} max={99} step={0.1}
                          value={bet.winProb}
                          onChange={e => updateBet(bet.id, "winProb", Number(e.target.value))}
                          style={{ width: 64, padding: "6px 8px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, color: "#f0f0f0", fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <input
                          type="number" min={1.01} step={0.01}
                          value={bet.odds}
                          onChange={e => updateBet(bet.id, "odds", Number(e.target.value))}
                          style={{ width: 64, padding: "6px 8px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, color: "#f0f0f0", fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <button
                          onClick={() => fillKelly(bet.id)}
                          style={{ padding: "5px 10px", background: betKelly.edge > 0 ? "#0a1a0e" : "#111", border: `1px solid ${betKelly.edge > 0 ? "#14532d" : "#1a1a1a"}`, borderRadius: 4, color: betKelly.edge > 0 ? "#4ade80" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          ${betKelly.edge > 0 ? suggestedStake.toLocaleString() : "0"}
                        </button>
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <input
                          type="number" min={0} step={10}
                          value={bet.stake}
                          onChange={e => updateBet(bet.id, "stake", Number(e.target.value))}
                          style={{ width: 80, padding: "6px 8px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, color: "#f0f0f0", fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: "7px 10px", fontSize: 12, fontWeight: 700, color: betEV >= 0 ? "#4ade80" : "#f87171", whiteSpace: "nowrap" }}>
                        {betEV >= 0 ? "+" : ""}${Math.round(betEV)}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <button onClick={() => removeBet(bet.id)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 10px 0", borderTop: "1px solid #0d0d0d", marginTop: 8, flexWrap: "wrap", gap: 12 }}>
            <button
              onClick={downloadBetslip}
              style={{ padding: "8px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#888", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              ↓ Export Betslip
            </button>
            <div style={{ display: "flex", gap: 32 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Stake</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f0" }}>${totalStake.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total EV</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: totalEV >= 0 ? "#22c55e" : "#ef4444" }}>
                  {totalEV >= 0 ? "+" : ""}${Math.round(totalEV)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parlay calculator */}
        {bets.length >= 2 && (
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Parlay Preview ({bets.length} legs)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {[
                { label: "Combined Odds", value: `${Math.round(parlayOdds * 100) / 100}x`, color: "#f97316" },
                { label: "Win Probability", value: `${Math.round(parlayWinProb * 10) / 10}%`, color: "#f0f0f0" },
                { label: "Parlay Edge", value: `${parlayEdge >= 0 ? "+" : ""}${Math.round(parlayEdge * 10) / 10}%`, color: parlayEdge >= 0 ? "#22c55e" : "#f87171" },
                { label: "Note", value: "Legs assumed independent", color: "#555" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#333", marginTop: 8, lineHeight: 1.7 }}>
          Kelly Criterion assumes win probability estimates are accurate. Half-Kelly or quarter-Kelly is recommended in practice. Not financial advice. 18+ only. Gamble responsibly.
        </p>
      </div>
      <Footer />
    </div>
  );
}
