"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getCurrentPredictions } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const { round } = getCurrentPredictions();

const QUICK_LINKS = [
  { label: "View HC Picks", href: "/predictions", desc: `Round ${round} picks are live now`, primary: true },
  { label: "DvP Rankings", href: "/defence", desc: "Find the sharpest matchups this week" },
  { label: "Your Dashboard", href: "/dashboard", desc: "Subscription details and referral link" },
  { label: "Simulator", href: "/simulator", desc: "Test model weight combinations" },
];

export default function ProWelcomePage() {
  const [accessStatus, setAccessStatus] = useState<'checking' | 'active' | 'timeout'>('checking');

  useEffect(() => {
    if (!supabase) { setAccessStatus('active'); return; }
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    let timerId: ReturnType<typeof setTimeout>;

    async function poll() {
      attempts++;
      try {
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user?.email) {
          setAccessStatus('active');
          return;
        }
        const { data } = await supabase!
          .from('user_profiles')
          .select('is_pro, pro_until')
          .eq('email', user.email)
          .maybeSingle();

        if (data?.is_pro) {
          setAccessStatus('active');
        } else if (attempts >= MAX_ATTEMPTS) {
          setAccessStatus('timeout');
        } else {
          timerId = setTimeout(poll, 3000);
        }
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          setAccessStatus('timeout');
        } else {
          timerId = setTimeout(poll, 3000);
        }
      }
    }

    timerId = setTimeout(poll, 2000);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "96px 20px 80px", textAlign: "center" }}>

        {/* Confetti via CSS */}
        <style>{`
          @keyframes confettiFall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
          }
          .confetti-piece {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 2px;
            animation: confettiFall 1.2s ease-out forwards;
          }
        `}</style>

        {/* Success icon with confetti */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          {[
            { left: "-30px", top: "10px", bg: "#f97316", delay: "0s" },
            { left: "30px", top: "-5px", bg: "#22c55e", delay: "0.1s" },
            { left: "-20px", top: "-10px", bg: "#60a5fa", delay: "0.2s" },
            { left: "20px", top: "15px", bg: "#f97316", delay: "0.05s" },
            { left: "-40px", top: "25px", bg: "#22c55e", delay: "0.15s" },
            { left: "40px", top: "5px", bg: "#60a5fa", delay: "0.25s" },
          ].map((c, i) => (
            <div key={i} className="confetti-piece" style={{ left: c.left, top: c.top, background: c.bg, animationDelay: c.delay }} />
          ))}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
          }}>
            ✓
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          Payment confirmed
        </div>

        <div style={{ fontSize: 12, color: accessStatus === 'active' ? "#22c55e" : accessStatus === 'timeout' ? "#888" : "#555", marginBottom: 8 }}>
          {accessStatus === 'checking' && "Activating your pro access..."}
          {accessStatus === 'active' && "Pro access active"}
          {accessStatus === 'timeout' && "Access activating — refresh in 30 seconds or contact support"}
        </div>

        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
          Welcome to SportSphere HQ Pro
        </h1>

        <p style={{ fontSize: 15, color: "#888", marginBottom: 10, lineHeight: 1.6 }}>
          Your account is now active. Round {round} picks are live right now.
        </p>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 36, lineHeight: 1.6 }}>
          Check your email for a confirmation from SportSphere HQ.
        </p>

        {/* Primary CTA */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/predictions" style={{
            display: "inline-block",
            padding: "14px 32px", borderRadius: 8,
            background: "#f97316", color: "#000",
            fontSize: 15, fontWeight: 700, textDecoration: "none",
          }}>
            View Round {round} Picks →
          </Link>
          <button
            onClick={() => window.location.href = '/predictions'}
            style={{
              padding: "14px 24px", borderRadius: 8,
              background: "transparent", color: "#888",
              fontSize: 15, fontWeight: 600,
              border: "1px solid #1f1f1f", cursor: "pointer",
            }}
          >
            View My Picks
          </button>
        </div>

        {/* Quick access grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 36, textAlign: "left" }}>
          {QUICK_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              background: l.primary ? "rgba(249,115,22,0.06)" : "#080808",
              border: l.primary ? "1px solid rgba(249,115,22,0.3)" : "1px solid #111",
              borderRadius: 10, padding: "16px", textDecoration: "none",
              display: "block",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: l.primary ? "#f97316" : "#f0f0f0", marginBottom: 4 }}>{l.label} →</div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{l.desc}</div>
            </Link>
          ))}
        </div>

        {/* What to expect */}
        <div style={{
          background: "#080808", border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 16, padding: "24px", textAlign: "left", marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            What to expect each week
          </div>
          {[
            { day: "Thursday", desc: "HC picks published the moment bookmaker lines release" },
            { day: "Thursday onwards", desc: "Results update automatically as games finish" },
            { day: "Monday", desc: "Weekly results digest email - full round P&L" },
          ].map(item => (
            <div key={item.day} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316", background: "#1a0800", border: "1px solid #f9731640", borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{item.day}</span>
              <span style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>
          Manage subscription anytime from your{" "}
          <Link href="/dashboard" style={{ color: "#666", textDecoration: "none" }}>dashboard</Link>.
          Questions? Email{" "}
          <a href="mailto:support@sportspherehq.com" style={{ color: "#666", textDecoration: "none" }}>
            support@sportspherehq.com
          </a>
        </p>
      </div>

      <Footer />
    </div>
  );
}
