"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ReferralLandingPage() {
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      sessionStorage.setItem("referral_code", code);
    }
  }, [code]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "120px 24px 80px", textAlign: "center" }}>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#030f08", border: "1px solid #14532d", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>Referred by a SportSphere Pro member</span>
        </div>

        <h1 style={{ fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 16px", lineHeight: 1.1 }}>
          Australia&apos;s sharpest<br />
          <span style={{ color: "#f97316" }}>AFL disposal model.</span>
        </h1>

        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 36px" }}>
          67.6% HC win rate · +$18,760 gross P&L · 71 picks verified across 5 rounds.
          Your Pro member thinks you should see this.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href={`/login?referral=${code}&next=/auth/payment`} style={{
            background: "#f97316", color: "#000",
            padding: "14px 32px", borderRadius: 10,
            fontSize: 15, fontWeight: 700, textDecoration: "none",
            display: "inline-block",
          }}>
            Create Account & Get Pro →
          </Link>
          <Link href="/predictions" style={{
            background: "transparent", color: "#888",
            padding: "14px 24px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, textDecoration: "none",
            border: "1px solid #1f1f1f", display: "inline-block",
          }}>
            See this round&apos;s picks first
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#111", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
          {[
            { value: "67.6%", label: "HC Win Rate" },
            { value: "+$18,760", label: "2026 P&L" },
            { value: "517x", label: "Sub ROI" },
          ].map(s => (
            <div key={s.label} style={{ background: "#050505", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f97316" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
