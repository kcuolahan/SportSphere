"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const PRO_FEATURES = [
  "Picks on publication day (Tuesday)",
  "H2H suppression intelligence",
  "Full simulator access",
  "Email alerts every Tuesday",
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      let userEmail: string | null = null;
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/signup");
          return;
        }
        userEmail = user.email ?? null;
      }

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "96px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Pro Access
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Get ahead of the market
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: 0, lineHeight: 1.6 }}>
            60.7% win rate tracked publicly. Pro members get picks the moment they publish every Tuesday.
          </p>
        </div>

        {/* Single Pro Card */}
        <div style={{
          background: "rgba(249,115,22,0.04)",
          border: "1px solid rgba(249,115,22,0.35)",
          borderRadius: 16,
          padding: "32px 28px",
        }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              SportSphere HQ Pro
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: "#f97316" }}>$29</span>
              <span style={{ fontSize: 16, color: "#888" }}>/month</span>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            {PRO_FEATURES.map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, color: "#ccc", lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <button
            onClick={startCheckout}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 8,
              border: "none", background: "#f97316",
              fontSize: 15, fontWeight: 700, color: "#000",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginBottom: 12, transition: "opacity 0.15s",
            }}
          >
            {loading ? "Redirecting…" : "Start Pro — $29/month"}
          </button>

          <div style={{ textAlign: "center", fontSize: 12, color: "#555" }}>
            Cancel anytime. No lock-in.
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
            <span style={{ fontSize: 11, color: "#555" }}>Secure payments via</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#635bff", letterSpacing: "-0.02em" }}>stripe</span>
          </div>
        </div>

        {/* Trust row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 32 }}>
          {[
            "60.7% win rate · verified publicly",
            "Cancel anytime",
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
