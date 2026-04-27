"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Suspense } from "react";

const ADMIN_PW = "sportsphereadmin2026";

interface PickRow {
  id: string;
  player_name: string;
  prediction: string;
  line: number;
  result: string | null;
  final_disposals: number | null;
}

function RolloverContent() {
  const searchParams = useSearchParams();
  const authed = searchParams.get("pw") === ADMIN_PW;

  const [currentRound, setCurrentRound] = useState<number>(8);
  const [picksSeeded, setPicksSeeded] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [results, setResults] = useState<PickRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [newRound, setNewRound] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(true);

  useEffect(() => {
    if (!authed) return;
    fetchStatus();
  }, [authed]);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/current-round");
      const data = await res.json();
      const round = data.round ?? 8;
      setCurrentRound(round);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: picks } = await supabase
        .from("live_picks")
        .select("id, player_name, prediction, line, result, final_disposals")
        .eq("round", round)
        .eq("tier", "HC")
        .order("player_name");

      const pickList = picks ?? [];
      setPicksSeeded(pickList.length > 0);
      setResults(pickList);

      const { data: roundData } = await supabase
        .from("rounds")
        .select("picks_alert_sent_at")
        .eq("round_number", round)
        .maybeSingle();
      setAlertSent(!!roundData?.picks_alert_sent_at);
    } catch {
      // silently ignore status fetch errors
    }
  }

  async function handleSeedPicks() {
    if (!file || !newRound) {
      setMessage("Select a file and enter a round number first");
      setMessageOk(false);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("round", newRound);
    const res = await fetch("/api/upload-picks", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) {
      setMessage("Error: " + data.error);
      setMessageOk(false);
    } else {
      setMessage(`Picks seeded successfully - ${data.count ?? "?"} picks inserted`);
      setMessageOk(true);
      setPicksSeeded(true);
      fetchStatus();
    }
    setLoading(false);
  }

  async function handleSendAlert() {
    setLoading(true);
    const res = await fetch("/api/send-picks-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundNumber: currentRound, secret: ADMIN_PW }),
    });
    const data = await res.json();
    if (data.success || data.emailsSent !== undefined) {
      setMessage(`Alert sent to ${data.emailsSent} subscribers`);
      setMessageOk(true);
      setAlertSent(true);
    } else {
      setMessage("Error sending alert: " + (data.error ?? "unknown"));
      setMessageOk(false);
    }
    setLoading(false);
  }

  async function handleForceResults() {
    setLoading(true);
    const res = await fetch("/api/auto-update-results");
    const data = await res.json();
    setMessage(`Results updated: ${data.updated ?? 0} picks matched, ${data.errors ?? 0} errors out of ${data.totalChecked ?? 0} checked`);
    setMessageOk(true);
    fetchStatus();
    setLoading(false);
  }

  async function handleSendDigest() {
    setLoading(true);
    const res = await fetch("/api/send-weekly-digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: ADMIN_PW }),
    });
    const data = await res.json();
    if (data.error) {
      setMessage("Error: " + data.error);
      setMessageOk(false);
    } else {
      setMessage(`Digest sent to ${data.emailsSent ?? 0} subscribers`);
      setMessageOk(true);
    }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 12px" }}>Admin Access Required</h1>
          <p style={{ fontSize: 13, color: "#555" }}>Add <code style={{ background: "#111", padding: "2px 6px", borderRadius: 4, color: "#f97316" }}>?pw=...</code> to the URL</p>
        </div>
      </div>
    );
  }

  const pending = results.filter(r => !r.result).length;
  const wins = results.filter(r => r.result === "WIN").length;
  const losses = results.filter(r => r.result === "LOSS").length;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "#0a0a0a",
    border: "1px solid #2a2a2a", borderRadius: 6, color: "#f0f0f0",
    fontSize: 13, boxSizing: "border-box",
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%", padding: "12px", background: loading ? "#555" : "#f97316",
    border: "none", borderRadius: 6, color: "#000", fontWeight: 700,
    fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    width: "100%", padding: "12px", background: loading ? "#555" : "#22c55e",
    border: "none", borderRadius: 6, color: "#000", fontWeight: 700,
    fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
  };

  const btnNeutral: React.CSSProperties = {
    width: "100%", padding: "12px", background: loading ? "#333" : "#1a1a1a",
    border: "1px solid #2a2a2a", borderRadius: 6, color: "#f0f0f0", fontWeight: 700,
    fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
  };

  const card: React.CSSProperties = {
    background: "#0d0d0d", border: "1px solid #1a1a1a",
    borderRadius: 12, padding: "24px", marginBottom: 16,
  };

  const stepBadge: React.CSSProperties = {
    background: "#f97316", color: "#000", fontWeight: 800,
    fontSize: 12, width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px 80px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Internal</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Weekly Rollover</h1>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>Command centre for seeding picks, sending alerts, and closing out rounds.</p>
        </div>

        {/* Status bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Current Round", value: `R${currentRound}`, color: "#f97316" },
            { label: "Picks Seeded", value: picksSeeded ? "Yes" : "No", color: picksSeeded ? "#22c55e" : "#888" },
            { label: "Alert Sent", value: alertSent ? "Yes" : "No", color: alertSent ? "#22c55e" : "#888" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{ padding: "12px 16px", background: messageOk ? "#030f08" : "#100303", border: `1px solid ${messageOk ? "#14532d" : "#450a0a"}`, borderRadius: 8, fontSize: 13, color: messageOk ? "#4ade80" : "#f87171", marginBottom: 20 }}>
            {message}
          </div>
        )}

        {/* Step 1: Seed */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={stepBadge}>1</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Seed Round Picks</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Upload Excel model file to seed HC picks into Supabase</div>
            </div>
            {picksSeeded && <span style={{ marginLeft: "auto", fontSize: 12, color: "#22c55e", fontWeight: 700 }}>Done</span>}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              type="number"
              placeholder="Round number (e.g. 9)"
              value={newRound}
              onChange={e => setNewRound(e.target.value)}
              style={{ ...inputStyle, width: 180, flex: "none" }}
            />
            <input
              type="file"
              accept=".xlsx"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <button onClick={handleSeedPicks} disabled={loading} style={btnPrimary}>
            {loading ? "Seeding..." : "Seed HC Picks"}
          </button>
        </div>

        {/* Step 2: Send alert */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={stepBadge}>2</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Send Email Alert</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Email all Pro subscribers with Round {currentRound} HC picks</div>
            </div>
            {alertSent && <span style={{ marginLeft: "auto", fontSize: 12, color: "#22c55e", fontWeight: 700 }}>Done</span>}
          </div>
          <button onClick={handleSendAlert} disabled={loading || !picksSeeded} style={btnSecondary}>
            {loading ? "Sending..." : `Send Alert - Round ${currentRound}`}
          </button>
          {!picksSeeded && (
            <p style={{ fontSize: 11, color: "#555", marginTop: 8, margin: "8px 0 0" }}>Seed picks first before sending alert</p>
          )}
        </div>

        {/* Step 3: Monitor results */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={stepBadge}>3</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Monitor Results</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                {results.length} picks: {wins}W / {losses}L / {pending} pending
              </div>
            </div>
          </div>
          <button onClick={handleForceResults} disabled={loading} style={{ ...btnNeutral, marginBottom: 16 }}>
            Force Update Results from Squiggle
          </button>
          {results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {results.map((pick) => (
                <div key={pick.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080808", borderRadius: 6, padding: "10px 14px" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{pick.player_name}</span>
                    <span style={{ fontSize: 11, color: "#666", marginLeft: 8 }}>
                      {pick.prediction} {pick.line}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {pick.final_disposals != null && (
                      <span style={{ fontSize: 11, color: "#888" }}>{pick.final_disposals} disp</span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: pick.result === "WIN" ? "rgba(34,197,94,0.15)" : pick.result === "LOSS" ? "rgba(239,68,68,0.12)" : "#111",
                      color: pick.result === "WIN" ? "#4ade80" : pick.result === "LOSS" ? "#f87171" : "#555",
                    }}>
                      {pick.result ?? "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Weekly digest */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={stepBadge}>4</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Send Weekly Digest</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Send Monday results email to all Pro subscribers</div>
            </div>
          </div>
          <button onClick={handleSendDigest} disabled={loading} style={btnNeutral}>
            {loading ? "Sending..." : "Send Results Digest"}
          </button>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Admin Dashboard", href: `/admin?pw=${ADMIN_PW}` },
            { label: "Seed Picks (old)", href: "/admin/seed-picks" },
            { label: "Live Predictions", href: "/predictions" },
            { label: "Track Record", href: "/accuracy" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "14px 16px", textDecoration: "none", display: "block", fontSize: 13, color: "#888", textAlign: "center" }}>
              {l.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RolloverPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#000" }} />}>
      <RolloverContent />
    </Suspense>
  );
}
