"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import pnlData from "@/data/paywall.json";
import { calculateROI } from "@/lib/calculations";

const roi = calculateROI(pnlData.hcStats);
const MAX_PROFIT = Math.max(...pnlData.roundBreakdown.map(r => r.netProfit));

function PaymentContent() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly", userEmail }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "100px 20px 60px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Account created ✓
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
          See what you&apos;re getting
        </h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.6 }}>
          HC picks have returned ${roi.grossProfit.toLocaleString()} gross profit over 3 months.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#111", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        {[
          { label: "Total Bets", value: pnlData.hcStats.totalBets, color: "#f0f0f0" },
          { label: "Win Rate", value: `${(pnlData.hcStats.winRate * 100).toFixed(1)}%`, color: "#4ade80" },
          { label: "Gross Profit", value: `$${roi.grossProfit.toLocaleString()}`, color: "#4ade80" },
          { label: "ROI", value: `${roi.roiBefore.toFixed(1)}%`, color: "#4ade80" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#080808", padding: "18px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* 2-col: Before/After fees + P&L chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>

        {/* Subscription impact */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Subscription Impact
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#666" }}>Gross profit</span>
              <span style={{ fontWeight: 700, color: "#f0f0f0" }}>${roi.grossProfit.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#666" }}>3-month fee</span>
              <span style={{ fontWeight: 700, color: "#f0f0f0" }}>−${roi.totalFees}</span>
            </div>
            <div style={{ height: 1, background: "#111" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#888", fontWeight: 600 }}>Net profit</span>
              <span style={{ fontWeight: 800, color: "#4ade80" }}>${roi.netProfit.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ background: "#030303", borderRadius: 6, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>
              {Math.round(roi.grossProfit / (pnlData.hcStats.monthlySubscriptionFee * 12))}×
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>subscription pays for itself annually</div>
          </div>
        </div>

        {/* P&L by round */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            P&amp;L by Round
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pnlData.roundBreakdown.map(r => (
              <div key={r.round} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, fontSize: 11, fontWeight: 600, color: "#555", flexShrink: 0 }}>R{r.round}</div>
                <div style={{ flex: 1, height: 28, background: "#111", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min((r.netProfit / MAX_PROFIT) * 100, 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #f97316, #ea580c)",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                    minWidth: 56,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>${r.netProfit.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ width: 44, textAlign: "right", fontSize: 10, color: "#666", flexShrink: 0 }}>
                  <span style={{ color: "#4ade80" }}>{r.wins}W</span>/{" "}
                  <span style={{ color: "#ef4444" }}>{r.losses}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div style={{
        background: "rgba(249,115,22,0.04)",
        border: "1px solid rgba(249,115,22,0.25)",
        borderRadius: 12,
        padding: "28px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f0", marginBottom: 2 }}>SportSphere HQ Pro</div>
            <div style={{ fontSize: 13, color: "#666" }}>Full access to all HC picks · Real-time results</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#f97316", letterSpacing: "-0.03em", lineHeight: 1 }}>
              $29<span style={{ fontSize: 15, fontWeight: 400, color: "#666" }}>/mo</span>
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Cancel anytime</div>
          </div>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "#100303", border: "1px solid #450a0a", borderRadius: 8, fontSize: 12, color: "#f87171", marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: "100%", padding: "15px",
            background: loading ? "#444" : "#f97316",
            border: "none", borderRadius: 8,
            fontSize: 15, fontWeight: 800, color: "#000",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
          }}
        >
          {loading ? "Redirecting to Stripe…" : "Complete Payment — $29/month →"}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "#444" }}>Secure payments via</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#635bff", letterSpacing: "-0.02em" }}>stripe</span>
        </div>
      </div>

    </div>
  );
}

export default function PaymentPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <Suspense fallback={<div style={{ padding: "120px 20px", textAlign: "center", color: "#555" }}>Loading…</div>}>
        <PaymentContent />
      </Suspense>
      <Footer />
    </div>
  );
}
