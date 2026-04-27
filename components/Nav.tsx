"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase, signOut } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const CENTRE_LINKS = [
  { href: "/predictions", label: "Picks" },
  { href: "/nba", label: "NBA", dim: true },
  { href: "/nfl", label: "NFL", dim: true },
  { href: "/players", label: "Players" },
  { href: "/model", label: "How It Works" },
  { href: "/fantasy", label: "Fantasy", badge: "NEW" },
];

const RIGHT_LINKS = [
  { href: "/accuracy", label: "Track Record", isPro: true },
  { href: "/round-preview", label: "Preview", isPro: true },
  { href: "/defence", label: "DvP", isPro: true },
  { href: "/betslip", label: "Betslip", isPro: true },
  { href: "/simulator", label: "Simulator", isPro: true, hideUnder1280: true },
  { href: "/tracker", label: "Tracker", isPro: true, hideUnder1280: true },
  { href: "/archive", label: "Archive", isPro: true, hideUnder1280: true },
];

const ALL_LINKS = [
  ...CENTRE_LINKS,
  ...RIGHT_LINKS,
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faq", label: "FAQ" },
  { href: "/responsible-gambling", label: "Responsible Gambling" },
  { href: "/login", label: "Sign In" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [round, setRound] = useState(8);
  const [season, setSeason] = useState(2026);

  useEffect(() => {
    if (!supabase) { setUser(null); return; }
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetch('/api/current-round')
      .then(r => r.json())
      .then(d => {
        if (d.round) setRound(d.round);
        if (d.season) setSeason(d.season);
      })
      .catch(() => {});
  }, []);

  const linkStyle = (active: boolean) => ({
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? "#f97316" : "#555",
    textDecoration: "none" as const,
    padding: "6px 10px",
    borderRadius: 6,
    borderBottom: active ? "1px solid #f97316" : "1px solid transparent",
    transition: "color 0.15s",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 5,
    whiteSpace: "nowrap" as const,
  });

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #111",
        padding: "0 20px",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>

          {/* Left - Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
            <img src="/logo.svg" alt="SportSphere HQ" width={28} height={28} style={{ width: 28, height: 28, flexShrink: 0 }} />
            <span className="nav-logo-label" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "#f0f0f0", lineHeight: 1, whiteSpace: "nowrap" }}>
              Sport<span style={{ color: "#f97316" }}>Sphere</span> HQ
            </span>
          </Link>

          {/* Centre - Main nav links */}
          <div className="nav-centre" style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
            {CENTRE_LINKS.map(link => {
              const active = pathname === link.href;
              const isDim = (link as { dim?: boolean }).dim;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={isDim
                    ? { ...linkStyle(false), color: "#383838", fontSize: 11 }
                    : linkStyle(active)
                  }
                >
                  {link.label}
                  {(link as { badge?: string }).badge && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#000", background: "#4ade80", borderRadius: 3, padding: "1px 4px", letterSpacing: "0.04em", lineHeight: 1.5, marginLeft: 3 }}>
                      {(link as { badge: string }).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right - Secondary links + controls */}
          <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {RIGHT_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={(link as any).hideUnder1280 ? "nav-hide-1280" : undefined}
                  style={linkStyle(active)}
                >
                  {link.label}
                  {link.isPro && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, color: "#f97316",
                      background: "#f9731618", border: "1px solid #f9731640",
                      borderRadius: 3, padding: "1px 4px", letterSpacing: "0.04em",
                      lineHeight: 1.5,
                    }}>PRO</span>
                  )}
                </Link>
              );
            })}

            <div style={{ width: 1, height: 16, background: "#1f1f1f", margin: "0 4px" }} />

            {/* Round indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }} className="nav-hide-1024">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 10, color: "#666", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                R{round} · {season}
              </span>
            </div>

            {/* Auth */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="nav-hide-1024">
                <Link href="/dashboard" style={{ fontSize: 11, color: "#555", textDecoration: "none", padding: "4px 8px" }}>
                  {user.email?.split("@")[0]}
                </Link>
                <button
                  onClick={() => signOut()}
                  style={{ fontSize: 11, color: "#555", background: "none", border: "1px solid #1f1f1f", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="nav-hide-1024" style={{ fontSize: 12, fontWeight: 600, color: "#f97316", textDecoration: "none", border: "1px solid #f9731640", borderRadius: 6, padding: "5px 12px", whiteSpace: "nowrap" }}>
                Sign In
              </Link>
            )}

            {/* Hamburger - mobile only (≤1024px) */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="nav-hamburger"
              style={{
                background: "none",
                border: "1px solid #1f1f1f",
                borderRadius: 6,
                padding: "6px 8px",
                cursor: "pointer",
                display: "none",
                flexDirection: "column",
                gap: 4,
              }}
              aria-label="Open menu"
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 18, height: 1.5, background: "#555", borderRadius: 1 }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: 240,
              background: "#080808",
              borderLeft: "1px solid #111",
              padding: "72px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 11, color: "#777" }}>Round {round} · {season}</span>
            </div>
            {ALL_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 700 : 400,
                    color: active ? "#f97316" : "#888",
                    textDecoration: "none",
                    padding: "10px 0",
                    borderBottom: "1px solid #0a0a0a",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {link.label}
                  {(link as { isPro?: boolean }).isPro && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, color: "#f97316",
                      background: "#f9731618", border: "1px solid #f9731640",
                      borderRadius: 3, padding: "1px 4px",
                    }}>PRO</span>
                  )}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                style={{ fontSize: 13, color: "#555", background: "none", border: "1px solid #1f1f1f", borderRadius: 5, padding: "8px 0", cursor: "pointer", marginTop: 12, textAlign: "left" }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: 14, color: "#f97316", textDecoration: "none", padding: "10px 0", marginTop: 8, fontWeight: 600 }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1280px) {
          .nav-hide-1280 { display: none !important; }
        }
        @media (max-width: 1024px) {
          .nav-centre { display: none !important; }
          .nav-right { gap: 8px !important; }
          .nav-hide-1024 { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (max-width: 768px) {
          .nav-logo-label { display: none !important; }
        }
      `}</style>
    </>
  );
}
