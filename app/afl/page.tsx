import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getCurrentPredictions } from "@/lib/data";

const { round } = getCurrentPredictions();

const FEATURES = [
  { label: "HC Picks", href: "/predictions", desc: `Round ${round} picks live now`, pro: false },
  { label: "Track Record", href: "/accuracy", desc: "67.6% win rate across R3 to R7", pro: true },
  { label: "DvP Rankings", href: "/defence", desc: "Defence vs Position matchup analytics", pro: true },
  { label: "Player Explorer", href: "/players", desc: "2025 and 2026 stat comparisons", pro: false },
  { label: "Simulator", href: "/simulator", desc: "Customise model weights, test picks", pro: true },
  { label: "Betslip Builder", href: "/betslip", desc: "Build and analyse your round betslip", pro: true },
];

const STATS = [
  { label: "HC Win Rate", value: "67.6%", sub: "48W / 23L", color: "#4ade80" },
  { label: "Gross P&L", value: "+$18,760", sub: "$1,000 flat stake", color: "#4ade80" },
  { label: "Total HC Picks", value: "71", sub: "Rounds 3 to 7", color: "#f0f0f0" },
  { label: "Avg Odds", value: "1.87", sub: "Decimal", color: "#f97316" },
];

export default function AFLPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "96px 20px 80px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          <a href="/" style={{ color: "#555", textDecoration: "none" }}>SportSphere</a>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#f0f0f0" }}>AFL</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 48, maxWidth: 600 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            2026 AFL Season
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.1 }}>
            AFL Disposal<br />
            <span style={{ color: "#f97316" }}>Analytics</span>
          </h1>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7, margin: 0 }}>
            The SportSphere model tracks disposal volume, DvP matchups and positional edges to find the highest-conviction bets each round. All results verified.
          </p>
        </div>

        {/* Season stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 48 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 16px" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f0f0f0", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Current round picks preview */}
        <div style={{ background: "#080808", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 16, padding: "28px", marginBottom: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backdropFilter: "none", background: "transparent" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Round {round} · HC Picks Live
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>This week's picks are ready</div>
            </div>
            <Link
              href="/predictions"
              style={{
                background: "#f97316", color: "#000", fontWeight: 800,
                fontSize: 14, padding: "10px 22px", borderRadius: 7,
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              View All Picks →
            </Link>
          </div>
          {/* Blurred pick teaser */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#0a0a0a", borderRadius: 8, padding: "14px 16px",
                filter: i === 0 ? "none" : "blur(5px)",
                userSelect: "none",
                opacity: i === 0 ? 1 : 0.5,
              }}>
                {i === 0 ? (
                  <>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>1 free pick preview</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Upgrade to Pro for all {round > 0 ? round : ''} HC picks</div>
                    </div>
                    <Link href="/auth/payment" style={{ fontSize: 12, fontWeight: 700, color: "#f97316", textDecoration: "none", border: "1px solid #f9731440", borderRadius: 5, padding: "5px 12px" }}>
                      Get Pro
                    </Link>
                  </>
                ) : (
                  <>
                    <div style={{ width: 140, height: 14, background: "#1a1a1a", borderRadius: 4 }} />
                    <div style={{ width: 60, height: 14, background: "#1a1a1a", borderRadius: 4 }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
            AFL Tools
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {FEATURES.map(f => (
              <Link
                key={f.href}
                href={f.href}
                style={{
                  background: "#080808",
                  border: "1px solid #111",
                  borderRadius: 10, padding: "20px 20px",
                  textDecoration: "none",
                  display: "block",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{f.label} →</span>
                  {f.pro && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#000", background: "#f97316", borderRadius: 3, padding: "1px 5px" }}>PRO</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: "#080808",
          border: "1px solid #1a1a1a",
          borderRadius: 16, padding: "36px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Unlock every AFL tool</div>
            <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6, maxWidth: 400 }}>
              Pro gives you HC picks, DvP rankings, simulator, betslip builder, and full track record. $29/month, cancel anytime.
            </div>
          </div>
          <Link
            href="/auth/payment"
            style={{
              background: "#f97316", color: "#000", fontWeight: 900,
              fontSize: 15, padding: "14px 32px", borderRadius: 8,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Get Pro - $29/month
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
