"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

interface Profile {
  email: string;
  is_pro: boolean;
  pro_until: string | null;
  created_at: string;
  referral_code: string | null;
  referral_count: number;
}

export default function DashboardPage() {
  const { isPro, isLoggedIn, loading: proLoading } = useProAccess();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_profiles")
        .select("email, is_pro, pro_until, created_at, referral_code, referral_count")
        .eq("email", user.email)
        .single();

      setProfile(data);
      setLoading(false);
    }
    if (!proLoading) load();
  }, [proLoading]);

  async function copyReferral() {
    if (!profile?.referral_code) return;
    await navigator.clipboard.writeText(`https://www.sportspherehq.com/ref/${profile.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!proLoading && !isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Sign in to view your dashboard</h1>
          <Link href="/login" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Sign In →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const proUntil = profile?.pro_until ? new Date(profile.pro_until) : null;
  const daysLeft = proUntil ? Math.ceil((proUntil.getTime() - Date.now()) / 86400000) : 0;
  const referralUrl = profile?.referral_code ? `https://www.sportspherehq.com/ref/${profile.referral_code}` : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "84px 20px 60px" }}>

        {loading ? (
          <div style={{ color: "#444", padding: "60px 0" }}>Loading…</div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Account</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
                {profile?.email?.split("@")[0] ?? "Dashboard"}
              </h1>
              <div style={{ fontSize: 13, color: "#555" }}>{profile?.email}</div>
            </div>

            {/* Subscription status */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ background: isPro ? "#030f08" : "#0a0a08", border: `1px solid ${isPro ? "#14532d" : "#78350f"}`, borderRadius: 12, padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isPro ? "#4ade80" : "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                      {isPro ? "Pro Member" : "Free Plan"}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                      {isPro ? "Full access active" : "Upgrade to unlock all HC picks"}
                    </div>
                    {isPro && proUntil && (
                      <div style={{ fontSize: 13, color: "#4ade8099" }}>
                        Access until {proUntil.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })} · {daysLeft} days remaining
                      </div>
                    )}
                    {!isPro && (
                      <div style={{ fontSize: 13, color: "#d97706" }}>
                        You&apos;re seeing 1 pick per round. Upgrade to see all HC signals.
                      </div>
                    )}
                  </div>
                  {!isPro && (
                    <Link href="/auth/payment" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                      Upgrade to Pro →
                    </Link>
                  )}
                </div>

                {isPro && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${isPro ? "#14532d" : "#1a1a1a"}` }}>
                    {[
                      { label: "HC Picks", href: "/predictions" },
                      { label: "Track Record", href: "/accuracy" },
                      { label: "Picks Archive", href: "/archive" },
                      { label: "Betslip", href: "/betslip" },
                      { label: "Simulator", href: "/simulator" },
                      { label: "DvP Rankings", href: "/defence" },
                    ].map(l => (
                      <Link key={l.href} href={l.href} style={{ background: "#0a1a0e", border: "1px solid #14532d", borderRadius: 6, padding: "10px 12px", textAlign: "center", textDecoration: "none", fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Referral */}
            {referralUrl && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px 28px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Your Referral Link</div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.6 }}>
                    Share your link. When someone signs up via your link, you get a month free when they convert to Pro.
                    {profile?.referral_count ? ` You've referred ${profile.referral_count} user${profile.referral_count !== 1 ? "s" : ""} so far.` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, padding: "10px 14px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, fontSize: 12, color: "#555", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {referralUrl}
                    </div>
                    <button
                      onClick={copyReferral}
                      style={{ padding: "10px 18px", background: copied ? "#14532d" : "#1a1a1a", border: "1px solid", borderColor: copied ? "#14532d" : "#2a2a2a", borderRadius: 6, color: copied ? "#4ade80" : "#888", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  {profile?.referral_count !== undefined && profile.referral_count > 0 && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#22c55e" }}>
                      {profile.referral_count} referral{profile.referral_count !== 1 ? "s" : ""} tracked
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Quick stats */}
            {isPro && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "Rounds Active", value: "5", sub: "R3 to R7 tracked" },
                    { label: "HC Picks This Season", value: "71", sub: "48W · 23L" },
                    { label: "HC Win Rate", value: "67.6%", sub: "2026 season" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>{s.value}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Referral widget */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Referral Program</div>
                  <Link href="/referral" style={{ fontSize: 11, color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Full dashboard →</Link>
                </div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 1.6 }}>
                  Earn 1 free month for every friend who subscribes.
                  {profile?.referral_count ? ` You've referred ${profile.referral_count} friend${profile.referral_count !== 1 ? "s" : ""}.` : ""}
                </div>
                {referralUrl ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, padding: "9px 12px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, fontSize: 11, color: "#555", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {referralUrl}
                    </div>
                    <button
                      onClick={copyReferral}
                      style={{ padding: "9px 16px", background: copied ? "#14532d" : "#1a1a1a", border: "1px solid", borderColor: copied ? "#14532d" : "#2a2a2a", borderRadius: 6, color: copied ? "#4ade80" : "#888", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <Link href="/referral" style={{ fontSize: 13, color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Get your referral link →</Link>
                )}
              </div>
            </section>

            {/* Account info */}
            <section>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px 28px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Account Details</div>
                {[
                  { label: "Email", value: profile?.email ?? "-" },
                  { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "-" },
                  { label: "Plan", value: isPro ? "Pro" : "Free" },
                  ...(isPro ? [
                    { label: "Status", value: "Active" },
                    { label: "Next billing", value: proUntil ? proUntil.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "-" },
                    { label: "Season ends", value: "September 2026" },
                  ] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #0d0d0d" }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: "#f0f0f0" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
