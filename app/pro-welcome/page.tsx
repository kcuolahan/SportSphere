"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getCurrentPredictions } from "@/lib/data";

const { round } = getCurrentPredictions();

const PRO_PERKS = [
  { icon: "⚡", label: "Picks on publish day", desc: "Every Tuesday the moment they go live" },
  { icon: "🔬", label: "H2H suppression intelligence", desc: "See when opponents historically suppress a player" },
  { icon: "🎛", label: "Full simulator access", desc: "Weight editor, grid search, scenario presets" },
  { icon: "📧", label: "Email alerts", desc: "Picks delivered to your inbox every Tuesday" },
  { icon: "📈", label: "Line movement tracking", desc: "Coming soon — see when sharp money moves lines" },
];

export default function ProWelcomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "96px 20px 80px", textAlign: "center" }}>

        {/* Success icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 24px",
        }}>
          ✓
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          Payment confirmed
        </div>

        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          Welcome to SportSphere HQ Pro
        </h1>

        <p style={{ fontSize: 16, color: "#888", marginBottom: 36, lineHeight: 1.6 }}>
          Your account is now active. Round {round} picks are live — you have full access right now.
        </p>

        <Link href="/predictions" style={{
          display: "inline-block",
          padding: "14px 32px", borderRadius: 8,
          background: "#f97316", color: "#000",
          fontSize: 15, fontWeight: 700, textDecoration: "none",
          marginBottom: 48,
        }}>
          View Round {round} Picks →
        </Link>

        {/* Pro perks summary */}
        <div style={{
          background: "#080808", border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 16, padding: "28px 24px", textAlign: "left",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
            What you now have access to
          </div>
          {PRO_PERKS.map(p => (
            <div key={p.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 32, fontSize: 12, color: "#444", lineHeight: 1.7 }}>
          Manage your subscription anytime via your Stripe customer portal.<br />
          Questions? Email us at{" "}
          <a href="mailto:support@sportspherehq.com" style={{ color: "#666", textDecoration: "none" }}>
            support@sportspherehq.com
          </a>
        </p>
      </div>

      <Footer />
    </div>
  );
}
