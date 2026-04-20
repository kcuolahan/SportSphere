import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { EmailSignup } from "@/components/EmailSignup";
import { getCurrentPredictions } from "@/lib/data";

const { round } = getCurrentPredictions();

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about SportSphere HQ, how the model works, and responsible gambling information.",
};

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderBottom: "1px solid #0a0a0a",
      paddingTop: 24, paddingBottom: 24,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", marginBottom: 10, lineHeight: 1.4 }}>
        {q}
      </div>
      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "84px 24px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Help & Info
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.04em", margin: 0 }}>
            Frequently Asked Questions
          </h1>
        </div>

        {/* About */}
        <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>About SportSphere HQ</div>

        <Q q="What is SportSphere HQ?">
          SportSphere HQ is an AFL disposal prediction analytics platform. We publish model outputs, edge scores, and verified accuracy data for AFL player disposal markets each round. We are an analytics tool — not a tipping service and not a bookmaker.
        </Q>

        <Q q="How does the model work?">
          SportSphere HQ uses a six-factor weighted prediction model that combines season averages, opponent concession rates, time-on-ground adjustment, play style factors, conditions multipliers, and CBA attendance data. Read the full technical breakdown on the{" "}
          <Link href="/model" style={{ color: "#f97316", textDecoration: "none" }}>How It Works</Link> page.
        </Q>

        <Q q="What does HIGH CONVICTION mean?">
          HIGH CONVICTION picks have an Edge/Vol score of 0.90 or above. This means the model's edge — the difference between its prediction and the bookie's line — is large relative to the player's typical disposal variance. It's the highest statistical confidence tier. Historically these picks have achieved 66%+ accuracy.
        </Q>

        <Q q="What does Edge/Vol (E/V) mean?">
          Edge/Vol is the model's edge divided by the player's estimated disposal standard deviation. It measures the statistical significance of the edge. An E/V of 1.0 means the edge is equal to one full standard deviation — a meaningfully large signal. An E/V of 0.20 means the edge is small relative to how much that player typically varies game-to-game.
        </Q>

        <Q q="Why are FWD players excluded from the bet filter?">
          FWD disposal predictions have achieved only 38% accuracy across the backtested sample — below break-even. FWD disposal counts are heavily influenced by game style, matching, and team tactics in ways the current model doesn't fully capture. FWD picks are still published for analysis, but they are excluded from the E/V filter.
        </Q>

        <Q q="How often are predictions updated?">
          Predictions are published each week before the round, once team selections and betting markets are available. The data is updated manually from the Excel model using the export pipeline. The generated timestamp on the predictions page shows when the current round's data was last updated.
        </Q>

        <Q q="What is the DvP (Defence vs Position) page?">
          The DvP page shows how many disposals each AFL team concedes per game to each position (MID, DEF, FWD, RUCK), expressed as a percentage above or below the league average. Teams that concede significantly more than average to a position are good targets for OVER bets on opposing players in that position.
        </Q>

        <Q q="Are you affiliated with any bookmaker?">
          No. SportSphere HQ is not affiliated with, sponsored by, or endorsed by any bookmaker or gambling operator. We do not receive referral fees or commissions from any betting platform.
        </Q>

        {/* Legal */}
        <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 40, marginBottom: 4 }}>Legal & Responsible Gambling</div>

        <Q q="Is this financial advice?">
          No. SportSphere HQ provides statistical analysis and model outputs only. Nothing on this platform constitutes financial advice, betting advice, or a recommendation to place any wager. All decisions are made solely at the user's own risk and discretion. Past model performance does not guarantee future results.
        </Q>

        <Q q="How do I use this responsibly?">
          SportSphere HQ is an analytical tool. If you choose to use this data in conjunction with betting markets, we strongly recommend: setting strict loss limits before you start, never chasing losses, treating every bet as independent and not part of a system, and taking regular breaks. The model helps identify statistical edges — it does not remove variance or guarantee profits.
        </Q>

        <Q q="I need help with problem gambling.">
          If gambling is having a negative impact on you or someone you know, support is available 24/7:
          <br /><br />
          <strong style={{ color: "#f0f0f0" }}>National Gambling Helpline:</strong>{" "}
          <a href="tel:1800858858" style={{ color: "#f97316", textDecoration: "none" }}>1800 858 858</a>
          <br />
          <strong style={{ color: "#f0f0f0" }}>Online support:</strong>{" "}
          <a href="https://www.gamblinghelponline.org.au" target="_blank" rel="noopener noreferrer" style={{ color: "#f97316", textDecoration: "none" }}>
            gamblinghelponline.org.au
          </a>
          <br />
          <strong style={{ color: "#f0f0f0" }}>Lifeline:</strong>{" "}
          <a href="tel:131114" style={{ color: "#f97316", textDecoration: "none" }}>13 11 14</a>
        </Q>

        {/* Full disclaimer */}
        <div style={{
          marginTop: 40,
          background: "#080808", border: "1px solid #111",
          borderRadius: 10, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Full Disclaimer
          </div>
          <p style={{ fontSize: 11, color: "#333", lineHeight: 1.9, margin: 0 }}>
            SportSphere HQ is an independent analytics platform providing data-driven analysis of AFL player disposal markets. All content is produced for analytical and informational purposes only. Nothing on this website constitutes financial advice, sports betting advice, or a recommendation to place any wager of any kind. SportSphere HQ does not accept any liability for decisions made by users based on information provided on this platform. Past accuracy data does not constitute a guarantee or prediction of future results. Disposal markets are inherently variable and unpredictable. Users must exercise their own judgment and are solely responsible for any betting decisions they make. You must be 18 years of age or older to access betting markets in Australia. If gambling is causing harm, please contact the National Gambling Helpline on 1800 858 858 or visit gamblinghelponline.org.au.
          </p>
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/model" style={{ fontSize: 12, color: "#f97316", textDecoration: "none" }}>
            How The Model Works →
          </Link>
          <Link href="/predictions" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>
            View Current Picks →
          </Link>
        </div>

        {/* Email signup */}
        <div style={{
          marginTop: 48,
          background: "#080808",
          border: "1px solid #111",
          borderRadius: 12,
          padding: "28px 28px",
        }}>
          <EmailSignup round={round} variant="footer" />
        </div>

      </div>

      <Footer />
    </div>
  );
}
