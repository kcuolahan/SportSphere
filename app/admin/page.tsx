"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Link from "next/link";

const ADMIN_PW = "sportsphereadmin2026";

interface SubStats {
  total: number;
  pro: number;
  recentJoins: { email: string; created_at: string; is_pro: boolean }[];
}

interface PickStats {
  round: number;
  hcCount: number;
  withResults: number;
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const pw = searchParams.get("pw");
  const authed = pw === ADMIN_PW;

  const [subStats, setSubStats] = useState<SubStats | null>(null);
  const [pickStats, setPickStats] = useState<PickStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertRound, setAlertRound] = useState("8");
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [digestStatus, setDigestStatus] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(8);
  const [picksSeeded, setPicksSeeded] = useState<boolean>(false);

  useEffect(() => {
    if (!authed) return;
    loadStats();
  }, [authed]);

  async function loadStats() {
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [profilesRes, picksRes] = await Promise.all([
      supabase.from("user_profiles").select("email, is_pro, created_at").order("created_at", { ascending: false }),
      supabase.from("live_picks").select("round, tier, result").eq("tier", "HC"),
    ]);

    const profiles = profilesRes.data ?? [];
    const picks = picksRes.data ?? [];

    const picksByRound: Record<number, { total: number; withResult: number }> = {};
    for (const p of picks) {
      if (!picksByRound[p.round]) picksByRound[p.round] = { total: 0, withResult: 0 };
      picksByRound[p.round].total++;
      if (p.result) picksByRound[p.round].withResult++;
    }

    const sortedRounds = Object.entries(picksByRound)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([round, s]) => ({ round: Number(round), hcCount: s.total, withResults: s.withResult }));

    const latestRound = sortedRounds.length > 0 ? sortedRounds[0].round : 8;
    const latestRoundPicks = sortedRounds.find(r => r.round === latestRound);

    setCurrentRound(latestRound);
    setPicksSeeded((latestRoundPicks?.hcCount ?? 0) > 0);
    setSubStats({
      total: profiles.length,
      pro: profiles.filter(p => p.is_pro).length,
      recentJoins: profiles.slice(0, 10),
    });
    setPickStats(sortedRounds);
    setLoading(false);
  }

  async function sendAlert() {
    setAlertStatus("Sending…");
    const res = await fetch("/api/send-picks-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundNumber: Number(alertRound), secret: ADMIN_PW }),
    });
    const data = await res.json();
    if (data.error) setAlertStatus(`Error: ${data.error}`);
    else setAlertStatus(`✓ Sent to ${data.emailsSent} subscribers (${data.pickCount} picks)`);
  }

  async function sendDigest() {
    setDigestStatus("Sending…");
    const res = await fetch("/api/send-weekly-digest", {
      headers: { Authorization: `Bearer ${ADMIN_PW}` },
    });
    const data = await res.json();
    if (data.error) setDigestStatus(`Error: ${data.error}`);
    else setDigestStatus(`✓ Sent to ${data.emailsSent} subscribers`);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 12px" }}>Admin Access Required</h1>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>Add <code style={{ background: "#111", padding: "2px 6px", borderRadius: 4, color: "#f97316" }}>?pw=...</code> to the URL to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Internal</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Admin Dashboard</h1>
        </div>

        {loading ? (
          <div style={{ color: "#444", padding: "40px 0" }}>Loading…</div>
        ) : (
          <>
            {/* Section 1: Season Status */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Season Status</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Current Round", value: `R${currentRound}`, color: "#f97316" },
                  { label: "Picks Seeded", value: picksSeeded ? "Yes" : "No", color: picksSeeded ? "#22c55e" : "#f87171" },
                  { label: "Alert Sent", value: alertStatus?.startsWith("✓") ? "Yes" : "—", color: alertStatus?.startsWith("✓") ? "#22c55e" : "#888" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: 30, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Quick Actions */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Send Round Alert</div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>Email all Pro subscribers with HC picks.</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                      type="number"
                      value={alertRound}
                      onChange={e => setAlertRound(e.target.value)}
                      placeholder="Round"
                      style={{ width: 80, padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 6, color: "#f0f0f0", fontSize: 13 }}
                    />
                    <button
                      onClick={sendAlert}
                      style={{ flex: 1, padding: "8px 14px", background: "#f97316", border: "none", borderRadius: 6, color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    >
                      Send Alert
                    </button>
                  </div>
                  {alertStatus && <div style={{ fontSize: 12, color: alertStatus.startsWith("✓") ? "#22c55e" : "#f87171" }}>{alertStatus}</div>}
                </div>

                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Weekly Digest</div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>Send season summary digest to all Pro subscribers.</div>
                  <button
                    onClick={sendDigest}
                    style={{ width: "100%", padding: "8px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#f0f0f0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    Send Digest
                  </button>
                  {digestStatus && <div style={{ fontSize: 12, color: digestStatus.startsWith("✓") ? "#22c55e" : "#f87171", marginTop: 8 }}>{digestStatus}</div>}
                </div>

                <Link href="/admin/seed-picks" style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px", textDecoration: "none", display: "block" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Seed Picks →</div>
                  <div style={{ fontSize: 12, color: "#555" }}>Upload picks JSON for a new round</div>
                </Link>

                <Link href="/accuracy" style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px", textDecoration: "none", display: "block" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Track Record →</div>
                  <div style={{ fontSize: 12, color: "#555" }}>View public accuracy page</div>
                </Link>
              </div>
            </section>

            {/* Section 3: Stats Summary */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>HC Stats Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Total HC Picks", value: "71", sub: "R3–R7", color: "#f0f0f0" },
                  { label: "HC Win Rate", value: "67.6%", sub: "48W · 23L", color: "#22c55e" },
                  { label: "Current Bankroll", value: "$19,760", sub: "From $1,000 start", color: "#f97316" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Subscriber stats */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Subscribers</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Total Users", value: subStats?.total ?? 0, color: "#f0f0f0" },
                  { label: "Pro Subscribers", value: subStats?.pro ?? 0, color: "#f97316" },
                  { label: "Free Users", value: (subStats?.total ?? 0) - (subStats?.pro ?? 0), color: "#888" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #0d0d0d", fontSize: 13, fontWeight: 600, color: "#888" }}>Recent Signups</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Email", "Joined", "Plan"].map(h => (
                        <th key={h} style={{ padding: "8px 16px", fontSize: 10, color: "#555", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(subStats?.recentJoins ?? []).map((u, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #0a0a0a" }}>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#f0f0f0" }}>{u.email}</td>
                        <td style={{ padding: "10px 16px", fontSize: 12, color: "#666" }}>{new Date(u.created_at).toLocaleDateString("en-AU")}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: u.is_pro ? "#f9731618" : "#111", color: u.is_pro ? "#f97316" : "#555", border: `1px solid ${u.is_pro ? "#f9731640" : "#1a1a1a"}` }}>
                            {u.is_pro ? "PRO" : "FREE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* HC Picks by Round */}
            <section>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>HC Picks by Round</div>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Round", "HC Picks", "With Results", "Coverage"].map(h => (
                        <th key={h} style={{ padding: "8px 16px", fontSize: 10, color: "#555", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pickStats.map((r, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #0a0a0a" }}>
                        <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, color: "#fff" }}>Round {r.round}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#888" }}>{r.hcCount}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#888" }}>{r.withResults}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: "#111", borderRadius: 2, maxWidth: 80 }}>
                              <div style={{ width: `${r.hcCount > 0 ? (r.withResults / r.hcCount) * 100 : 0}%`, height: "100%", background: r.withResults === r.hcCount ? "#22c55e" : "#f97316", borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, color: "#666" }}>{r.withResults === r.hcCount ? "Complete" : `${r.hcCount - r.withResults} pending`}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
