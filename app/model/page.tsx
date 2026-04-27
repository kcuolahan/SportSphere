import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { strongRate, strongPicks, filteredRate, filteredPicks, roundsLabel, currentSeason } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "How The Model Works",
  description: "A technical breakdown of the SportSphere HQ AFL disposal prediction model - six factors, Edge/Vol filtering, position thresholds, and dynamic season blending.",
};

function Section({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: "#f97316",
          letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0,
        }}>
          {num}
        </div>
        <h2 style={{ fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function FactorRow({ name, weight, desc }: { name: string; weight: string; desc: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 80px 2fr",
      gap: 16, padding: "14px 0", borderBottom: "1px solid #0a0a0a",
      alignItems: "start",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{name}</div>
      <div style={{
        fontSize: 12, fontWeight: 700, color: "#f97316",
        background: "#1a0f00", border: "1px solid #f9731630",
        padding: "2px 8px", borderRadius: 4, textAlign: "center",
        alignSelf: "start",
      }}>{weight}</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: "#080808", border: "1px solid #1a1a1a",
      borderLeft: "2px solid #f97316",
      borderRadius: 8, padding: "16px 20px", marginTop: 20,
    }}>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export default function ModelPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "84px 24px 60px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Model Documentation
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 16px" }}>
            How The Model Works
          </h1>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
            A full technical breakdown of how SportSphere HQ generates AFL disposal predictions - every factor, every weight, every filter. No black boxes.
          </p>
        </div>

        {/* Section 1 */}
        <Section num="01" title="The six factors">
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginTop: 0 }}>
            Every prediction is a weighted combination of six data inputs. Each factor is given a sensitivity weight that determines how strongly it pulls the prediction away from the player's baseline average.
          </p>
          <div style={{ borderTop: "1px solid #111", marginTop: 8 }}>
            <FactorRow
              name="2026 Season Average"
              weight="65% blend"
              desc="The player's current-season average disposals. By Round 6, this dominates the season blend at 65% weighting - we trust recent data more than historical as sample size builds."
            />
            <FactorRow
              name="2025 Season Average"
              weight="35% blend"
              desc="Full prior-season average. Provides a stable baseline, especially early in the season when 2026 data is thin. The blend ratio shifts each round (see Section 5)."
            />
            <FactorRow
              name="Opponent Adjustment"
              weight="25% sensitivity"
              desc="How many disposals this opponent typically concedes to this position vs league average. An opponent conceding +12% more than average to DEFs lifts the predicted line. Sensitivity is capped at 0.30 to prevent over-weighting noisy early-season data."
            />
            <FactorRow
              name="TOG-Adjusted Rate"
              weight="40% sensitivity"
              desc="Disposal rate per 1% time-on-ground, normalised to an 82% TOG baseline, then scaled to the player's expected TOG for this game. A player playing more minutes should be expected to accumulate more disposals."
            />
            <FactorRow
              name="CBA / Form Trajectory"
              weight="10% sensitivity"
              desc="Centre bounce attendance effect for midfielders. A player getting more CBAs than the positional average gets a small uplift. Dampened to 0.10 sensitivity to prevent over-inflation on players with volatile CBA counts."
            />
            <FactorRow
              name="Play Style Factor"
              weight="60% sensitivity"
              desc="TRANS (transition) players get a 1.05 multiplier in dry conditions - they generate disposals through run and carry. STOP (stoppage) players get 0.90 - their disposals come from contested ball, which is more volatile. HYBRID players sit at 1.00."
            />
          </div>
        </Section>

        {/* Section 2 */}
        <Section num="02" title="The Edge/Vol filter">
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginTop: 0 }}>
            Raw edge (model prediction minus bookie line) alone is not sufficient to identify a bet worth taking. A 4-disposal edge means something very different on a player with a standard deviation of 3.5 vs one with a standard deviation of 8.0.
          </p>
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>
            The Edge/Vol ratio divides edge by the player's estimated disposal standard deviation to produce a signal-to-noise measure. This is the core innovation of the model.
          </p>

          <div style={{
            background: "#080808", border: "1px solid #1a1a1a",
            borderRadius: 10, padding: "20px 24px", marginTop: 20, marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Worked Example
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>LOW volatility player</div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.8 }}>
                  Bookie line: 27.5<br />
                  Model prediction: 31.5<br />
                  Edge: +4.0<br />
                  Std Dev: 3.5<br />
                  <strong style={{ color: "#22c55e" }}>Edge/Vol: 1.14 → HIGH CONVICTION</strong>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginBottom: 8 }}>HIGH volatility player</div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.8 }}>
                  Bookie line: 18.5<br />
                  Model prediction: 22.5<br />
                  Edge: +4.0<br />
                  Std Dev: 8.0<br />
                  <strong style={{ color: "#ef4444" }}>Edge/Vol: 0.50 → borderline - filter with caution</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #111" }}>
            {[
              { tier: "HIGH CONVICTION", ev: "≥ 0.90", desc: "Strong statistical signal. Edge is large relative to the player's typical variance. Highest-confidence picks." },
              { tier: "BET", ev: "0.50 to 0.89", desc: "Meaningful edge that clears the statistical noise threshold. Worth including in analysis." },
              { tier: "SKIP", ev: "< 0.50", desc: "Edge exists but may be within normal variance. The model shows a lean but not a high-confidence edge." },
            ].map(t => (
              <div key={t.tier} style={{ display: "grid", gridTemplateColumns: "140px 80px 1fr", gap: 16, padding: "14px 0", borderBottom: "1px solid #0a0a0a", alignItems: "start" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.ev === "≥ 0.90" ? "#f97316" : t.ev.startsWith("0.50") ? "#22c55e" : "#666" }}>{t.tier}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>{t.ev}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <InfoBox>
            HIGH CONVICTION picks (E/V ≥ 0.90) achieved {strongRate}% accuracy across {strongPicks} picks. Filtered picks (E/V ≥ 0.50) achieved {filteredRate}% across {filteredPicks} picks. {roundsLabel}, {currentSeason} season.
          </InfoBox>
        </Section>

        {/* Section 3 */}
        <Section num="03" title="Position-specific thresholds">
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginTop: 0 }}>
            Bookmakers price different positions differently. MID markets are tighter (more efficient) than FWD markets, which are the widest. The model uses separate STRONG thresholds per position to reflect this.
          </p>
          <div style={{ borderTop: "1px solid #111" }}>
            {[
              { pos: "MID", threshold: "≥ 3.0 disposal edge", note: "Most liquid market. Bookmakers price MIDs well. Standard threshold." },
              { pos: "DEF", threshold: "≥ 3.0 disposal edge", note: "Similar liquidity to MID. DEF markets have been profitable historically." },
              { pos: "FWD", threshold: "≥ 4.5 disposal edge", note: "EXCLUDED from bet filter. Model accuracy on FWDs is 38% - below break-even. FWDs are listed for analysis only." },
              { pos: "RUCK", threshold: "≥ 5.0 disposal edge", note: "Very conservative. Disposals are a poor proxy for RUCK performance - contest stats drive their role, not disposals." },
              { pos: "Premium (line ≥ 27)", threshold: "+2.0 bonus edge required", note: "Players with high bookie lines are priced more efficiently. An extra 2.0 disposal edge is required for STRONG on these players." },
            ].map(p => (
              <div key={p.pos} style={{ display: "grid", gridTemplateColumns: "100px 160px 1fr", gap: 16, padding: "14px 0", borderBottom: "1px solid #0a0a0a", alignItems: "start" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.pos}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>{p.threshold}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{p.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4 */}
        <Section num="04" title="Conditions and multipliers">
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginTop: 0 }}>
            External game conditions affect disposal counts. The model applies multipliers on top of the base prediction.
          </p>
          <div style={{ borderTop: "1px solid #111" }}>
            {[
              { factor: "Dry conditions", mult: "×1.00", desc: "Baseline. No adjustment." },
              { factor: "Wet conditions", mult: "×0.95 base", desc: "Rain reduces total disposals across the game. Additionally: TRANS players (×0.95) are more penalised as run-and-carry is harder. STOP players (×1.04) benefit - congestion and contested ball increases." },
              { factor: "Roof venue (Marvel Stadium)", mult: "×1.02", desc: "Indoor venues produce marginally higher disposal counts. The roof removes weather risk and the surface tends to produce faster, higher-disposal games." },
              { factor: "2026 rule changes - DEF", mult: "×1.03", desc: "Rule changes boosted intercept marking (+11% league-wide) disproportionately benefitting defenders who read the play." },
              { factor: "2026 rule changes - RUCK", mult: "×0.90", desc: "Ruck contest rule changes reduced centre bounce frequency by 16%, directly cutting RUCK disposal counts." },
            ].map(p => (
              <div key={p.factor} style={{ display: "grid", gridTemplateColumns: "180px 90px 1fr", gap: 16, padding: "14px 0", borderBottom: "1px solid #0a0a0a", alignItems: "start" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.factor}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>{p.mult}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5 */}
        <Section num="05" title="Dynamic season blending">
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginTop: 0 }}>
            Early in the season, the 2026 data is thin (2 to 3 games). The model blends 2025 full-season averages with 2026 data using round-dependent weights. As the season progresses and 2026 data becomes more reliable, it takes over.
          </p>
          <div style={{ borderTop: "1px solid #111" }}>
            {[
              { round: "Rds 1-3", blend: "60% 2025 / 40% 2026", note: "Early season - 2026 data is thin. 2025 full-season averages dominate." },
              { round: "Rds 4-7", blend: "20% 2025 / 80% 2026", note: "2026 data becomes reliable. Heavy weighting shifts to current season." },
              { round: "Rds 8-11", blend: "20% 2025 / 80% 2026", note: "Stable mid-season blend. 2025 retained as a small anchor." },
              { round: "Rds 12-17", blend: "10% 2025 / 90% 2026", note: "2026 data now authoritative. 2025 used only for stability." },
              { round: "Rd 18+", blend: "5% 2025 / 95% 2026", note: "Finals and late rounds - almost entirely current season data." },
            ].map(p => (
              <div key={p.round} style={{ display: "grid", gridTemplateColumns: "100px 200px 1fr", gap: 16, padding: "14px 0", borderBottom: "1px solid #0a0a0a", alignItems: "start" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{p.round}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>{p.blend}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{p.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 6 */}
        <Section num="06" title="What the model doesn't do">
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginTop: 0 }}>
            Transparency means being clear about limitations, not just strengths.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { issue: "Real-time injury news", detail: "The model does not scrape team selection or last-minute injury updates. Always check official team lists before acting on any analysis. A key teammate out can dramatically change a player's disposal count." },
              { issue: "FWD accuracy is 38%", detail: "FWDs are listed for analysis but are excluded from the bet filter. The model does not explain why FWD predictions underperform - it's a known limitation, not a solved problem." },
              { issue: "Early-season opponent factors are noisy", detail: "Opponent concession data is unreliable before Round 6 (small sample size). The model halves opponent sensitivity (0.30 vs 0.60) to compensate. Treat early-season DvP data with caution." },
              { issue: "This is a decision-support tool", detail: "The model identifies statistical edges. It does not account for every variable - weather changes, game-day motivations, selection surprises. It is a tool, not a guarantee." },
            ].map(item => (
              <div key={item.issue} style={{
                background: "#080808", border: "1px solid #111",
                borderRadius: 8, padding: "16px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", marginBottom: 6 }}>{item.issue}</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>

      <Footer />
    </div>
  );
}
