"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { supabase } from "@/lib/supabase";

interface FreePick {
  player: string;
  team: string;
  position: string;
  direction: string;
  bookie_line: number;
  edge_vol: number;
}

interface Props {
  totalPicksAvailable: number;
  totalHCPicksAvailable: number;
  freePicks: FreePick[];
  onDismiss: () => void;
}

export function FreeTierPaywall({ totalPicksAvailable, totalHCPicksAvailable, freePicks, onDismiss }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          router.push(`/auth/payment?email=${encodeURIComponent(user.email)}`);
          return;
        }
      }
      router.push("/auth/signup?redirect=/auth/payment");
    } finally {
      setLoading(false);
    }
  }

  const potentialProfit = Math.round(totalHCPicksAvailable * 1000 * 0.607 * 0.87);

  return (
    <div style={{
      background: "rgba(249,115,22,0.04)",
      border: "1px solid rgba(249,115,22,0.25)",
      borderRadius: 12,
      padding: "24px",
      marginBottom: 20,
    }}>
      <div className="paywall-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* LEFT: 2 free picks */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Your free picks this round
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {freePicks.map((pick, i) => (
              <div key={i} style={{
                background: "#080808",
                border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <PlayerAvatar name={pick.player} team={pick.team} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{pick.player}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{pick.team} · {pick.position}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: pick.direction === "OVER" ? "#22c55e" : "#ef4444" }}>
                    {pick.direction} {pick.direction === "OVER" ? "⬆" : "⬇"} {pick.bookie_line}
                  </div>
                  <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>E/V {pick.edge_vol.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>
            Viewing {freePicks.length} of {totalPicksAvailable} picks ({totalHCPicksAvailable} HC) this round.
          </div>
        </div>

        {/* RIGHT: Upgrade CTA */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Unlock All Picks
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0f0", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 8 }}>
            You&apos;re viewing {freePicks.length} of {totalHCPicksAvailable} HC picks available this round.
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
            {totalHCPicksAvailable} HIGH CONVICTION picks ={" "}
            <span style={{ color: "#f97316", fontWeight: 700 }}>
              ${potentialProfit.toLocaleString()}+ potential profit*
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            {[
              `All ${totalHCPicksAvailable} HC picks (today)`,
              "Full simulator access",
              "Email alerts (Tuesdays)",
              "H2H suppression intelligence",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#ccc" }}>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              padding: "13px 20px",
              background: loading ? "#444" : "#f97316",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              color: "#000",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 10,
              transition: "opacity 0.15s",
              textAlign: "center",
            }}
          >
            {loading ? "Loading…" : "Start Pro - $29/month"}
          </button>

          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              fontSize: 12,
              color: "#555",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
          >
            Continue free →
          </button>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #111", fontSize: 10, color: "#444", lineHeight: 1.6 }}>
            *Based on 60.7% win rate, $1k/bet, 1.87 avg odds
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .paywall-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
