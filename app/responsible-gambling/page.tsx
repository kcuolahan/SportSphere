"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

const RESOURCES = [
  {
    name: "Gambling Help Online",
    phone: null,
    url: "https://www.gamblinghelponline.org.au",
    description: "Free online counselling, information and support for people affected by gambling.",
  },
  {
    name: "National Gambling Helpline",
    phone: "1800 858 858",
    url: null,
    description: "Free, confidential counselling and referral service available 24 hours a day, 7 days a week.",
  },
  {
    name: "Lifeline",
    phone: "13 11 14",
    url: "https://www.lifeline.org.au",
    description: "Crisis support and suicide prevention. Available 24/7.",
  },
  {
    name: "Beyond Blue",
    phone: "1300 22 4636",
    url: "https://www.beyondblue.org.au",
    description: "Support for anxiety and depression, including issues related to problem gambling.",
  },
];

const SIGNS = [
  "Spending more than you can afford to lose",
  "Chasing losses by placing more bets",
  "Gambling to escape stress, anxiety, or personal problems",
  "Lying about your gambling to family or friends",
  "Missing work, school, or family commitments due to gambling",
  "Feeling irritable or anxious when not gambling",
  "Borrowing money or selling items to fund gambling",
  "Feeling guilty or ashamed after gambling",
];

const TIPS = [
  { title: "Set a budget", body: "Decide how much you can afford to lose before you start. Never gamble with money needed for bills, food, or rent." },
  { title: "Set time limits", body: "Decide in advance how long you'll spend gambling and stick to it. Take regular breaks." },
  { title: "Never chase losses", body: "Accept losses as the cost of entertainment. Chasing losses leads to bigger losses." },
  { title: "Don't bet when emotional", body: "Avoid betting when stressed, depressed, or under the influence of alcohol or drugs." },
  { title: "Treat betting as entertainment", body: "Treat any money you spend on betting as you would any other entertainment expense - not as an investment." },
  { title: "Use platform tools", body: "Use deposit limits, time-outs, and self-exclusion features offered by your bookmaker." },
];

export default function ResponsibleGamblingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f97316", borderRadius: 6, padding: "4px 12px", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#000" }}>18+</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Responsible Gambling
          </h1>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7, maxWidth: 600, margin: 0 }}>
            SportSphere HQ provides analytical tools for informed decision-making. We are committed to promoting safe gambling practices. Please read this page carefully.
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: "#100806", border: "1px solid #78350f",
          borderRadius: 12, padding: "24px", marginBottom: 40,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Important Disclaimer
          </div>
          <p style={{ fontSize: 14, color: "#d97706", lineHeight: 1.7, margin: 0 }}>
            SportSphere HQ provides analytical data and predictions for informational and entertainment purposes only. Nothing on this platform constitutes financial advice, betting advice, or any recommendation to place a wager. Past performance does not guarantee future results. All betting involves financial risk. Only bet with money you can afford to lose.
          </p>
        </div>

        {/* Warning signs */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
            Warning Signs of Problem Gambling
          </h2>
          <div style={{
            background: "#080808", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: "24px",
          }}>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
              You may have a gambling problem if you:
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {SIGNS.map((sign, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#888" }}>
                  <span style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }}>▸</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Safe gambling tips */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
            Safe Gambling Tips
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ background: "#000", padding: "20px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 6 }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{tip.title}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{tip.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
            Help & Support Resources
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RESOURCES.map((r, i) => (
              <div key={i} style={{
                background: "#080808", border: "1px solid #1a1a1a",
                borderRadius: 10, padding: "20px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 16, flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{r.description}</div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.phone && (
                    <a href={`tel:${r.phone.replace(/\s/g, "")}`} style={{
                      display: "inline-block", background: "#1a1a1a",
                      color: "#22c55e", borderRadius: 6, padding: "8px 14px",
                      fontSize: 13, fontWeight: 700, textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}>
                      {r.phone}
                    </a>
                  )}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-block", background: "#1a1a1a",
                      color: "#f97316", borderRadius: 6, padding: "8px 14px",
                      fontSize: 13, fontWeight: 700, textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}>
                      Visit site →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Self-exclusion */}
        <section style={{ marginBottom: 48 }}>
          <div style={{
            background: "#030f08", border: "1px solid #14532d",
            borderRadius: 12, padding: "28px",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px", color: "#4ade80" }}>
              Self-Exclusion
            </h2>
            <p style={{ fontSize: 14, color: "#4ade8099", lineHeight: 1.7, margin: "0 0 16px" }}>
              If you feel you need a break from gambling, most Australian jurisdictions offer formal self-exclusion programs. Contact your bookmaker directly to activate self-exclusion, or use BetStop - Australia&apos;s national self-exclusion register.
            </p>
            <a href="https://www.betstop.gov.au" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-block", background: "#14532d",
              color: "#4ade80", borderRadius: 6, padding: "10px 20px",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              Visit BetStop →
            </a>
          </div>
        </section>

        {/* Back to site */}
        <div style={{ textAlign: "center", paddingTop: 16, borderTop: "1px solid #111" }}>
          <Link href="/" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>
            ← Back to SportSphere HQ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
