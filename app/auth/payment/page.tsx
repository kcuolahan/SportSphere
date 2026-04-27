"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AnnualROIProof } from "@/components/AnnualROIProof";
import { useStats } from "@/lib/useStats";

const FAQ_ITEMS = [
  {
    q: "When do I get access?",
    a: "Immediately after payment. Your account is upgraded automatically and you can view all HC picks right away.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click from your dashboard. No cancellation fees.",
  },
  {
    q: "What's included in Pro?",
    a: "All HC picks for every round, real-time results as games finish, full track record analytics, Defence vs Position rankings, the Weight Optimisation Simulator, and Tracker.",
  },
  {
    q: "Is this financial advice?",
    a: "No. SportSphere HQ provides analytical data for informational purposes only. Nothing here is betting or financial advice. Always bet responsibly.",
  },
  {
    q: "Do you cover NRL or other sports?",
    a: "AFL is the primary focus for 2026. NRL coverage is planned for future seasons.",
  },
];

function PaymentContent() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const stats = useStats();

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
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "100px 20px 60px" }}>

      {/* Hook - headline */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#030f08", border: "1px solid #14532d", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, letterSpacing: "0.06em" }}>
            {stats.hc.winRatePct}% HC Win Rate · {stats.projections.roundsTracked} Rounds Tracked
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px", lineHeight: 1.1 }}>
          Your $174 AFL season subscription<br />
          <span style={{ color: "#22c55e" }}>returns {stats.projections.subscriptionMultiple}x.</span>
        </h1>
        <p style={{ fontSize: 15, color: "#666", margin: "0 auto", maxWidth: 500, lineHeight: 1.7 }}>
          That&apos;s not marketing copy. That&apos;s the actual math based on {stats.hc.totalPicks} verified HC picks at a {stats.hc.winRatePct}% win rate with $1,000 flat stake.
        </p>
      </div>

      {/* Social proof strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1, background: "#111", border: "1px solid #111",
        borderRadius: 12, overflow: "hidden", marginBottom: 36,
      }}>
        {[
          { value: `${stats.hc.winRatePct}%`, label: "HC Win Rate", sub: `${stats.hc.wins}W · ${stats.hc.losses}L` },
          { value: `+$${stats.hc.grossPL.toLocaleString()}`, label: "2026 Gross P&L", sub: "$1,000 flat stake" },
          { value: `${stats.projections.subscriptionMultiple}x`, label: "Return on $174", sub: "subscription multiple" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#050505", padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ROI proof */}
      <div style={{ marginBottom: 32 }}>
        <AnnualROIProof />
      </div>

      {/* Payment card */}
      <div style={{
        background: "rgba(249,115,22,0.04)",
        border: "1px solid rgba(249,115,22,0.3)",
        borderRadius: 14,
        padding: "32px",
        marginBottom: 32,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0f0", marginBottom: 4 }}>SportSphere HQ Pro</div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
              Full access · All HC picks · Real-time results<br />
              Simulator · Tracker · Picks Archive · DvP
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#f97316", letterSpacing: "-0.03em", lineHeight: 1 }}>
              $29<span style={{ fontSize: 16, fontWeight: 400, color: "#666" }}>/mo</span>
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>$174 for full AFL season</div>
          </div>
        </div>

        {/* Feature checklist */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {[
            "All HC picks every round",
            "Real-time result tracking",
            "Full analytics dashboard",
            "Defence vs Position (DvP)",
            "Weight Optimisation Simulator",
            "Picks archive (all rounds)",
            "Weekly performance digest",
            "Cancel anytime",
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#888" }}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
              {f}
            </div>
          ))}
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
            width: "100%", padding: "16px",
            background: loading ? "#444" : "#f97316",
            border: "none", borderRadius: 8,
            fontSize: 16, fontWeight: 800, color: "#000",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
          }}
        >
          {loading ? "Redirecting to Stripe…" : "Get Pro - $29/month →"}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: "#22c55e" }}>🔒</span>
            <span style={{ fontSize: 11, color: "#444" }}>Secure via Stripe</span>
          </div>
          <div style={{ width: 1, height: 12, background: "#222" }} />
          <span style={{ fontSize: 11, color: "#444" }}>Cancel anytime</span>
          <div style={{ width: 1, height: 12, background: "#222" }} />
          <span style={{ fontSize: 11, color: "#444" }}>AFL season access</span>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{
              background: "#080808", border: "1px solid #111",
              borderRadius: 8, overflow: "hidden",
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", padding: "16px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left", color: "#f0f0f0",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.q}</span>
                <span style={{ fontSize: 18, color: "#555", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#666", lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
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
