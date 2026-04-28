"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { signUp, supabase } from "@/lib/supabase";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { error: err } = await signUp(email, password);
    if (err) { setLoading(false); setError(err.message); return; }

    try {
      await supabase
        .from("user_profiles")
        .update({ referral_code: generateReferralCode() })
        .eq("email", email);
    } catch {}

    const referralCode = typeof window !== "undefined" ? sessionStorage.getItem("referral_code") : null;
    if (referralCode) {
      try {
        await fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: referralCode, action: "convert" }),
        });
        sessionStorage.removeItem("referral_code");
      } catch {}
    }

    setLoading(false);
    router.push(`/auth/payment?email=${encodeURIComponent(email)}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "120px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <img src="/logo.svg" alt="SportSphere HQ" width={40} height={40} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
            SportSphere HQ
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            One step closer to Pro access.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "#100303", border: "1px solid #450a0a", borderRadius: 8, fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, fontSize: 14, color: "#f0f0f0", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" required
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, fontSize: 14, color: "#f0f0f0", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", marginTop: 4,
            background: loading ? "#444" : "#f97316",
            border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 700, color: "#000",
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <div style={{ textAlign: "center", fontSize: 12, color: "#555", marginTop: 4 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#f97316", textDecoration: "none" }}>Sign in</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
