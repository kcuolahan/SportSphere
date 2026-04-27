"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useProAccess } from "@/lib/auth";
import Link from "next/link";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function ReferralPage() {
  const { isPro, isLoggedIn, loading: proLoading } = useProAccess();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (proLoading || !isLoggedIn) return;

    async function load() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_profiles")
        .select("referral_code, referral_count")
        .eq("email", user.email)
        .single();

      if (data?.referral_code) {
        setReferralCode(data.referral_code);
        setReferralCount(data.referral_count ?? 0);
      } else {
        const code = generateReferralCode();
        await supabase
          .from("user_profiles")
          .update({ referral_code: code })
          .eq("email", user.email);
        setReferralCode(code);
      }
      setLoading(false);
    }
    load();
  }, [proLoading, isLoggedIn]);

  if (!proLoading && !isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Sign in to access referrals</h1>
          <Link href="/login" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Sign In →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!proLoading && !isPro) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Pro Only</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>Referral Program</h1>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 32px" }}>
            Earn 1 free month for every friend you refer who subscribes to Pro.
            Upgrade to Pro to get your unique referral link.
          </p>
          <Link href="/auth/payment" style={{ background: "#f97316", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Upgrade to Pro - $29/month →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const referralUrl = referralCode ? `https://www.sportspherehq.com/ref/${referralCode}` : null;
  const twitterText = referralUrl
    ? encodeURIComponent(
        `I've been using @SportSphereHQ for AFL disposal picks - 67.6% win rate this season, $18,760 gross profit. Check it out: ${referralUrl}`
      )
    : "";
  const twitterHref = `https://twitter.com/intent/tweet?text=${twitterText}`;

  async function copyLink() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Pro Feature</div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Referral Program</h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.7 }}>
            Earn 1 free month for every friend who subscribes via your link.
          </p>
        </div>

        {/* Reward summary */}
        <div style={{ background: "#030f08", border: "1px solid #14532d", borderRadius: 12, padding: "24px 28px", marginBottom: 32, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>🎁</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>
              You earn 1 free month for every friend who subscribes
            </div>
            <div style={{ fontSize: 13, color: "#4ade8099", lineHeight: 1.6 }}>
              Share your unique link. When a friend signs up and converts to Pro, you automatically get 1 month added to your subscription - no cap.
            </div>
          </div>
        </div>

        {/* Stats */}
        {referralCount > 0 && (
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px", marginBottom: 28, textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>{referralCount}</div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
              {referralCount === 1 ? "friend referred" : "friends referred"} = {referralCount} month{referralCount !== 1 ? "s" : ""} free earned
            </div>
          </div>
        )}

        {/* Referral link */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "24px", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Your Referral Link</div>

          {loading ? (
            <div style={{ height: 42, background: "#111", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : referralUrl ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, padding: "11px 14px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, fontSize: 13, color: "#666", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {referralUrl}
                </div>
                <button
                  onClick={copyLink}
                  style={{ padding: "11px 20px", background: copied ? "#14532d" : "#f97316", border: "none", borderRadius: 6, color: copied ? "#4ade80" : "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={twitterHref}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0", borderRadius: 6, padding: "9px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X (Twitter)
                </a>
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, padding: "9px 16px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  View Dashboard →
                </Link>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#555" }}>Unable to load referral code. Try refreshing.</div>
          )}
        </div>

        {/* How it works */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>How It Works</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { step: "01", text: "Share your unique referral link with friends or on social media." },
              { step: "02", text: "When they click your link, their browser remembers your referral code." },
              { step: "03", text: "If they sign up and subscribe to Pro, your account gets 1 free month - automatically." },
              { step: "04", text: "No cap. Refer 10 friends, get 10 months free." },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#f97316", flexShrink: 0, marginTop: 2 }}>{item.step}</span>
                <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
      <Footer />
    </div>
  );
}
