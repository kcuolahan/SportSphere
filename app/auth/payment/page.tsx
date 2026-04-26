"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AnnualROIProof } from "@/components/AnnualROIProof";

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
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Account created ✓
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
          See what you&apos;re getting
        </h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.6 }}>
          Real numbers. Verified results. 5 rounds of HC pick performance.
        </p>
      </div>

      {/* ROI proof */}
      <div style={{ marginBottom: 24 }}>
        <AnnualROIProof />
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
