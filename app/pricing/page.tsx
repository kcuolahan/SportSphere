"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const FREE_FEATURES = [
  { ok: true,  text: "Round picks (48hr delay after publish)" },
  { ok: true,  text: "Full track record & accuracy stats" },
  { ok: true,  text: "DvP matchup rankings" },
  { ok: true,  text: "Model explainer" },
  { ok: true,  text: "Player statistics & explorer" },
  { ok: false, text: "Picks on publish day (Tuesday)" },
  { ok: false, text: "H2H suppression intelligence" },
  { ok: false, text: "Full simulator + grid search" },
  { ok: false, text: "Email alerts every Tuesday" },
  { ok: false, text: "Line movement tracking" },
];

const PRO_FEATURES = [
  { ok: true, text: "Everything in Free" },
  { ok: true, text: "Picks published Tuesday (publish day)" },
  { ok: true, text: "H2H suppression & boost flags" },
  { ok: true, text: "Full weight simulator + grid search" },
  { ok: true, text: "Email alerts every Tuesday" },
  { ok: true, text: "Line movement alerts (coming soon)" },
  { ok: true, text: "Priority support" },
];

function FeatureRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
      <span style={{
        fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 1,
        color: ok ? "#22c55e" : "#444",
      }}>
        {ok ? "✓" : "✗"}
      </span>
      <span style={{ fontSize: 13, color: ok ? "#cccccc" : "#555", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: "monthly" | "annual") {
    const isAnnual = plan === "annual";
    setError(null);
    if (isAnnual) setLoadingAnnual(true);
    else setLoadingMonthly(true);

    try {
      // Check if user is logged in
      let userEmail: string | null = null;
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/signup?redirect=pricing");
          return;
        }
        userEmail = user.email ?? null;
      }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userEmail }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoadingMonthly(false);
      setLoadingAnnual(false);
    }
  }

  const cardBase: React.CSSProperties = {
    background: "#080808",
    border: "1px solid #1a1a1a",
    borderRadius: 16,
    padding: "32px 28px",
    flex: 1,
    minWidth: 280,
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "96px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Pro Access
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Get ahead of the market
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: 0, maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            60.7% win rate tracked publicly. Pro members get picks the moment they publish every Tuesday.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>

          {/* FREE */}
          <div style={cardBase}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Free
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: "#f0f0f0" }}>$0</span>
              </div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Forever free · No card required</div>
            </div>

            <div style={{ flex: 1, marginBottom: 24 }}>
              {FREE_FEATURES.map((f, i) => <FeatureRow key={i} ok={f.ok} text={f.text} />)}
            </div>

            <a
              href="/signup"
              style={{
                display: "block", textAlign: "center",
                padding: "12px 20px", borderRadius: 8,
                border: "1px solid #222", background: "transparent",
                fontSize: 14, fontWeight: 600, color: "#888",
                textDecoration: "none", cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
            >
              Create free account →
            </a>
          </div>

          {/* PRO */}
          <div style={{
            ...cardBase,
            border: "1px solid rgba(249,115,22,0.35)",
            background: "rgba(249,115,22,0.04)",
            position: "relative",
          }}>
            {/* Popular badge */}
            <div style={{
              position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
              background: "#f97316", color: "#000",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
              padding: "3px 14px", borderRadius: 20,
            }}>MOST POPULAR</div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Pro
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: "#f97316" }}>$29</span>
                <span style={{ fontSize: 14, color: "#888" }}>/month</span>
                <span style={{ fontSize: 12, color: "#555", marginLeft: 4 }}>or $249/year</span>
              </div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                Cancel anytime. No contracts.
              </div>
            </div>

            <div style={{ flex: 1, marginBottom: 28 }}>
              {PRO_FEATURES.map((f, i) => <FeatureRow key={i} ok={f.ok} text={f.text} />)}
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            {/* Monthly button */}
            <button
              onClick={() => startCheckout("monthly")}
              disabled={loadingMonthly || loadingAnnual}
              style={{
                width: "100%", padding: "13px 20px", borderRadius: 8,
                border: "none", background: "#f97316",
                fontSize: 14, fontWeight: 700, color: "#000",
                cursor: loadingMonthly || loadingAnnual ? "not-allowed" : "pointer",
                opacity: loadingMonthly || loadingAnnual ? 0.7 : 1,
                marginBottom: 10, transition: "opacity 0.15s",
              }}
            >
              {loadingMonthly ? "Redirecting…" : "Start Pro Monthly — $29/mo"}
            </button>

            {/* Annual button */}
            <button
              onClick={() => startCheckout("annual")}
              disabled={loadingMonthly || loadingAnnual}
              style={{
                width: "100%", padding: "13px 20px", borderRadius: 8,
                border: "1px solid rgba(249,115,22,0.4)", background: "transparent",
                fontSize: 14, fontWeight: 700, color: "#f97316",
                cursor: loadingMonthly || loadingAnnual ? "not-allowed" : "pointer",
                opacity: loadingMonthly || loadingAnnual ? 0.7 : 1,
                marginBottom: 8, position: "relative", transition: "opacity 0.15s",
              }}
            >
              {loadingAnnual ? "Redirecting…" : (
                <>
                  Start Pro Annual — $249/yr
                  <span style={{
                    marginLeft: 8, fontSize: 9, fontWeight: 800, color: "#000",
                    background: "#22c55e", borderRadius: 4, padding: "2px 6px",
                    verticalAlign: "middle",
                  }}>SAVE 28%</span>
                </>
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Secure payments via</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#635bff", letterSpacing: "-0.02em" }}>stripe</span>
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            "60.7% win rate · 611 verified picks",
            "Cancel anytime · No lock-in",
            "Secure via Stripe",
          ].map(text => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
              <span style={{ color: "#22c55e" }}>✓</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
