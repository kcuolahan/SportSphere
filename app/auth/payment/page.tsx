"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "120px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <img src="/logo.svg" alt="SportSphere HQ" width={40} height={40} style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Account created ✓
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
          You&apos;re almost in.
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: 0, lineHeight: 1.6 }}>
          Complete payment to unlock Pro access.
        </p>
      </div>

      <div style={{
        width: "100%",
        background: "rgba(249,115,22,0.04)",
        border: "1px solid rgba(249,115,22,0.3)",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 20,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>SportSphere HQ Pro</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#f97316", letterSpacing: "-0.03em" }}>
          $29<span style={{ fontSize: 16, fontWeight: 400, color: "#666" }}>/month</span>
        </div>
      </div>

      {error && (
        <div style={{ width: "100%", padding: "10px 14px", background: "#100303", border: "1px solid #450a0a", borderRadius: 8, fontSize: 12, color: "#f87171", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          width: "100%", padding: "14px",
          background: loading ? "#444" : "#f97316",
          border: "none", borderRadius: 8,
          fontSize: 15, fontWeight: 700, color: "#000",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: 12, transition: "opacity 0.15s",
        }}
      >
        {loading ? "Redirecting to Stripe…" : "Pay Now — $29/month"}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
        <span style={{ fontSize: 11, color: "#555" }}>Secure payments via</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#635bff", letterSpacing: "-0.02em" }}>stripe</span>
        <span style={{ fontSize: 11, color: "#555" }}>· Cancel anytime</span>
      </div>

      <Link href="/predictions" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>
        Continue free — no payment required →
      </Link>
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
