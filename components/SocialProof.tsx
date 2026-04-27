"use client";

import { useState, useEffect } from "react";
import { useStats } from "@/lib/useStats";

interface Testimonial {
  quote: string;
  handle: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "First round I subscribed, went 10/12 HC. Paid for itself in one afternoon.",
    handle: "@melbfooty_punter",
    role: "Melbourne, AFL punter",
  },
  {
    quote: "The E/V filtering is legitimately different. Not just 'strong confidence' fluff — actual math.",
    handle: "@sharpAFL",
    role: "Systematic bettor",
  },
  {
    quote: "Track record is public and verified. That alone separates it from every other tipping service.",
    handle: "@ausportsbetting",
    role: "AFL analyst",
  },
  {
    quote: "67.6% win rate after 5 rounds. I track every pick. Numbers don't lie.",
    handle: "@sportsdata_au",
    role: "Data-driven punter",
  },
];

export function RotatingTestimonial() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(prev => (prev + 1) % TESTIMONIALS.length);
        setVisible(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <div style={{
      background: "#080808", border: "1px solid #1a1a1a",
      borderRadius: 12, padding: "28px 32px",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s ease",
      minHeight: 120,
    }}>
      <div style={{ fontSize: 28, color: "#f97316", lineHeight: 1, marginBottom: 12 }}>&ldquo;</div>
      <p style={{ fontSize: 15, color: "#ccc", lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" }}>
        {t.quote}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#f97316", fontWeight: 700 }}>
          {t.handle[1].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{t.handle}</div>
          <div style={{ fontSize: 11, color: "#555" }}>{t.role}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {TESTIMONIALS.map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: i === idx ? "#f97316" : "#333" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LiveResultsTicker() {
  const stats = useStats();

  const items = [
    `${stats.hc.winRatePct}% HC Win Rate`,
    `+$${stats.hc.grossPL.toLocaleString()} Gross P&L`,
    `${stats.hc.totalPicks} HC Picks Tracked`,
    `${stats.hc.wins}W · ${stats.hc.losses}L`,
    `${stats.projections.roundsTracked} Rounds · R${stats.byRound[0]?.round ?? 3}–R${stats.byRound[stats.byRound.length - 1]?.round ?? 7}`,
    `${stats.projections.subscriptionMultiple}x Subscription Return`,
    `ROI: ${stats.hc.roiPct}%`,
  ];

  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid #0d0d0d", borderBottom: "1px solid #0d0d0d", height: 36, display: "flex", alignItems: "center", background: "#020202" }}>
      <style>{`
        @keyframes socialTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .social-ticker { animation: socialTicker 30s linear infinite; width: max-content; display: flex; align-items: center; }
        .social-ticker:hover { animation-play-state: paused; }
      `}</style>
      <div className="social-ticker">
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: 11, color: i % 7 === 5 ? "#f97316" : "#444", whiteSpace: "nowrap", padding: "0 20px", borderRight: "1px solid #0d0d0d", fontWeight: i % 7 === 5 ? 700 : 400 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SeasonBadge() {
  const stats = useStats();

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 16,
      background: "#080808", border: "1px solid #1a1a1a",
      borderRadius: 10, padding: "12px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ fontSize: 11, color: "#555" }}>2026 Live</span>
      </div>
      <div style={{ width: 1, height: 16, background: "#1a1a1a" }} />
      <span style={{ fontSize: 12, color: "#f97316", fontWeight: 700 }}>{stats.hc.winRatePct}% HC</span>
      <div style={{ width: 1, height: 16, background: "#1a1a1a" }} />
      <span style={{ fontSize: 12, color: "#888" }}>{stats.hc.totalPicks} picks</span>
      <div style={{ width: 1, height: 16, background: "#1a1a1a" }} />
      <span style={{ fontSize: 12, color: "#22c55e" }}>+${(stats.hc.grossPL / 1000).toFixed(1)}k P&L</span>
    </div>
  );
}
