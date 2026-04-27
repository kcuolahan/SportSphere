"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

export default function RoundPreviewPage() {
  const { isPro, loading: proLoading } = useProAccess();

  if (proLoading) return <div style={{ minHeight: "100vh", background: "#000" }} />;

  if (!isPro) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f9731618", border: "1px solid #f9731640", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#f97316", letterSpacing: "0.08em" }}>PRO</span>
            <span style={{ fontSize: 11, color: "#f97316" }}>Early Access</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Round Preview</h1>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 32px" }}>
            Pre-round analysis including key matchups, DvP quick hits, and team news - available to Pro subscribers before picks go live.
          </p>
          <Link href="/auth/payment" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Unlock Pro - $29/month →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f9731618", border: "1px solid #f9731640", borderRadius: 20, padding: "5px 12px", marginBottom: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#f97316" }}>PRO</span>
            <span style={{ fontSize: 11, color: "#f97316" }}>Early Access</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Round 8 Preview
          </h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0 }}>What the model is watching this week.</p>
        </div>

        {/* Picks timing notice */}
        <div style={{ background: "#030f08", border: "1px solid #14532d", borderRadius: 10, padding: "14px 20px", marginBottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#4ade80" }}>
            <strong>Picks go live Thursday</strong> when bookmaker lines are released. Check back then for full HC signals.
          </span>
        </div>

        {/* Section 1: Key matchups */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Key Matchups
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                label: "High-volume MID matchups",
                body: "Watch for midfielders going into soft DvP matchups this round. The model targets mismatches where the opponent has conceded 10%+ above position average.",
              },
              {
                label: "DEF opportunity rounds",
                body: "Rounds where the top defensive teams face each other typically suppress disposal counts. The model adjusts line expectations accordingly.",
              },
              {
                label: "RUCK contested situations",
                body: "When top-line rucks face each other, tap-outs are shared. Look for secondary rucks in those matchups to outperform expectations.",
              },
            ].map((item, i) => (
              <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.65 }}>{item.body}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#444", marginTop: 10 }}>
            Specific player signals unlock Thursday when lines are confirmed.
          </p>
        </section>

        {/* Section 2: DvP quick hits */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            DvP Quick Hits
          </div>
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px" }}>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, margin: "0 0 16px" }}>
              Defence vs Position (DvP) rankings show which teams concede the most disposals to each position.
              High concession rate = opportunity for OVER bets. Low concession rate = opportunity for UNDER bets.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/defence" style={{ display: "inline-block", background: "#f9731618", border: "1px solid #f9731640", color: "#f97316", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                View Full DvP Rankings →
              </Link>
            </div>
          </div>
        </section>

        {/* Section 3: Team news */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Team News
          </div>
          <div style={{ background: "#100806", border: "1px solid #78350f", borderRadius: 10, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>Check official team selections</div>
            <p style={{ fontSize: 13, color: "#8b6a3e", lineHeight: 1.7, margin: "0 0 14px" }}>
              Team selections are released Thursday. Before placing any bet, verify the player is named in the starting lineup.
              Late changes announced on match day can invalidate any prediction.
            </p>
            <a
              href="https://www.afl.com.au/matches/teams"
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", background: "#78350f", color: "#f59e0b", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
            >
              AFL.com.au Team Selections →
            </a>
          </div>
        </section>

        {/* Bottom note */}
        <div style={{ paddingTop: 24, borderTop: "1px solid #111", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#444", lineHeight: 1.7, margin: 0 }}>
            Full HC picks published Thursday · Analytics only - not financial advice · 18+ · Gamble responsibly
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
