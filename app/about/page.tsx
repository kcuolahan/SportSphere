import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { roundsLabel, currentSeason } from "@/lib/siteData";

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 60, minHeight: "100vh", background: "#000" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 72px" }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              About
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f0f0", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              SportSphere HQ
            </h1>
            <p style={{ fontSize: 15, color: "#777", margin: 0, maxWidth: 560, lineHeight: 1.7 }}>
              An independent AFL disposal analytics model built to cut through noise and find genuine statistical edges in player prop markets.
            </p>
          </div>

          {/* Section 1 -What is SportSphere HQ */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              What is SportSphere HQ?
            </h2>
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "24px 28px" }}>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, margin: "0 0 16px" }}>
                SportSphere HQ is a statistical model that predicts AFL player disposal counts and evaluates player prop betting lines offered by bookmakers. It identifies picks where the model has genuine confidence the bookmaker line is mispriced.
              </p>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, margin: "0 0 16px" }}>
                Every pick is graded using <strong style={{ color: "#f97316" }}>Edge/Volatility (E/V)</strong> -the ratio of predicted edge to historical standard deviation. This measures not just whether the model predicts differently from the line, but whether that difference is statistically meaningful.
              </p>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, margin: 0 }}>
                Picks are tiered into <strong style={{ color: "#f97316" }}>HC (High Conviction, E/V ≥ 0.90)</strong>, <strong style={{ color: "#60a5fa" }}>SHARP (E/V 0.70 to 0.89)</strong>, and <strong style={{ color: "#22c55e" }}>BET (E/V 0.50 to 0.69)</strong>. Picks below 0.50 are shown for reference only and excluded from recommendations.
              </p>
            </div>
          </section>

          {/* Section 2 -Track Record */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              Track Record
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1, background: "#111", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              {[
                { label: "HC Win Rate", value: "67.6%", sub: "71 picks - R3 to R7", color: "#f97316" },
                { label: "Season P&L", value: "+$18,760", sub: "$1,000 flat stake", color: "#22c55e" },
                { label: "Rounds Tracked", value: "5", sub: "R3, R4, R5, R6, R7", color: "#f0f0f0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "#080808", padding: "20px 24px" }}>
                  <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>
              All results verified against Wheeloratings actual disposal data. {roundsLabel} · {currentSeason} AFL season.
              Full pick-by-pick history available on the{" "}
              <a href="/accuracy" style={{ color: "#f97316", textDecoration: "none" }}>Track Record</a> page.
            </p>
          </section>

          {/* Section 3 -Who Built This */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              Who Built This?
            </h2>
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "24px 28px" }}>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, margin: "0 0 16px" }}>
                Built by a financial analyst who spends his days researching companies, reading balance sheets, and modelling cash flows for a living. The same analytical framework that drives investment decisions - edge identification, probability weighting, and disciplined position sizing - turned out to translate directly to AFL disposal markets.
              </p>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, margin: "0 0 16px" }}>
                SportSphere is what happens when you apply institutional research discipline to sports analytics. The model was built from scratch using historical AFL player data, bookmaker line history, and a custom Edge/Volatility framework. Every design decision - from the tier system to the position exclusions - is grounded in backtested results, not intuition.
              </p>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, margin: 0 }}>
                SportSphere HQ is not affiliated with any bookmaker, tipping service, or betting syndicate.
              </p>
            </div>
          </section>

          {/* Section 4 -Legal */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              Legal & Disclaimer
            </h2>
            <div style={{ background: "#0a0500", border: "1px solid #78350f", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ background: "#f97316", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.06em", flexShrink: 0 }}>
                  18+
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fb923c" }}>You must be 18 or over to use this service.</span>
              </div>
              {[
                "SportSphere HQ provides statistical analysis only. Nothing published here constitutes financial advice, betting advice, or a recommendation to place any wager.",
                "Past model performance does not guarantee future results. All predictions carry inherent uncertainty.",
                "SportSphere HQ is not a licensed financial service provider and is not regulated by ASIC or any gambling authority.",
                "You are solely responsible for any betting decisions you make. Never bet more than you can afford to lose.",
                "AFL match and player statistics are used for analytical purposes. SportSphere HQ is not affiliated with the AFL or any club.",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: "#888", lineHeight: 1.7, padding: "10px 0", borderBottom: "1px solid #1c0a00" }}>
                  {item}
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#111", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "#888" }}>
                  If gambling is affecting you or someone you know, call the{" "}
                  <strong style={{ color: "#f97316" }}>National Gambling Helpline: 1800 858 858</strong>{" "}
                  (24/7, free) or visit{" "}
                  <a href="https://www.gamblinghelponline.org.au" target="_blank" rel="noopener noreferrer" style={{ color: "#f97316", textDecoration: "none" }}>
                    gamblinghelponline.org.au
                  </a>.
                </span>
              </div>
            </div>
          </section>

          {/* Section 5 -Contact */}
          <section style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              Contact
            </h2>
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "General queries", href: "mailto:support@sportspherehq.com", text: "support@sportspherehq.com" },
                  { label: "Data errors or corrections", href: "mailto:support@sportspherehq.com", text: "support@sportspherehq.com" },
                  { label: "Methodology questions", href: "/model", text: "Read how the model works →" },
                  { label: "Common questions", href: "/faq", text: "Read the FAQ →" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #111" }}>
                    <span style={{ fontSize: 13, color: "#666" }}>{row.label}</span>
                    <a href={row.href} style={{ fontSize: 13, color: "#f97316", textDecoration: "none", fontWeight: 600 }}>{row.text}</a>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
