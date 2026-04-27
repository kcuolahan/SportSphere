"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "@/lib/supabase";
import { useProAccess } from "@/lib/auth";

const LEFT_LINKS = [
  { href: "/afl", label: "AFL", alsoActive: ["/predictions"] },
  { href: "/nba", label: "NBA" },
  { href: "/nfl", label: "NFL" },
  { href: "/fantasy", label: "Fantasy", badge: "NEW" },
];

const PRO_RIGHT_LINKS = [
  { href: "/accuracy", label: "Track Record" },
  { href: "/defence", label: "DvP" },
  { href: "/simulator", label: "Simulator", hideUnder1280: true },
  { href: "/betslip", label: "Betslip", hideUnder1280: true },
  { href: "/tracker", label: "Tracker", hideUnder1280: true },
];

const FREE_RIGHT_LINKS = [
  { href: "/players", label: "Players" },
  { href: "/model", label: "How It Works" },
];

const ALL_MOBILE_LINKS = [
  { href: "/afl", label: "AFL" },
  { href: "/nba", label: "NBA" },
  { href: "/nfl", label: "NFL" },
  { href: "/fantasy", label: "Fantasy", badge: "NEW" },
  { href: "/players", label: "Players" },
  { href: "/model", label: "How It Works" },
  { href: "/predictions", label: "Picks (AFL)" },
  { href: "/accuracy", label: "Track Record", isPro: true },
  { href: "/defence", label: "DvP", isPro: true },
  { href: "/simulator", label: "Simulator", isPro: true },
  { href: "/betslip", label: "Betslip", isPro: true },
  { href: "/tracker", label: "Tracker", isPro: true },
  { href: "/archive", label: "Archive", isPro: true },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faq", label: "FAQ" },
  { href: "/responsible-gambling", label: "Responsible Gambling" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [round, setRound] = useState(8);
  const [showProToast, setShowProToast] = useState(false);

  const { isPro, isLoggedIn, loading: proLoading, userEmail } = useProAccess();

  useEffect(() => {
    fetch('/api/current-round')
      .then(r => r.json())
      .then(d => { if (d.round) setRound(d.round); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!proLoading && isPro && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('pro_toast_shown')) {
      setShowProToast(true);
      sessionStorage.setItem('pro_toast_shown', 'true');
      setTimeout(() => setShowProToast(false), 3000);
    }
  }, [isPro, proLoading]);

  function isActive(link: { href: string; alsoActive?: string[] }) {
    if (pathname === link.href) return true;
    if (link.alsoActive?.includes(pathname)) return true;
    return false;
  }

  const linkStyle = (active: boolean) => ({
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? "#f97316" : "#777",
    textDecoration: "none" as const,
    padding: "6px 10px",
    borderRadius: 6,
    borderBottom: active ? "2px solid #f97316" : "2px solid transparent",
    transition: "color 0.15s",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 5,
    whiteSpace: "nowrap" as const,
  });

  const proBadge = {
    fontSize: 9 as const,
    fontWeight: 800 as const,
    color: "#000",
    background: "#f97316",
    borderRadius: 3,
    padding: "1px 5px",
    letterSpacing: "0.04em" as const,
    lineHeight: 1.5 as const,
  };

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.94)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #111",
        padding: "0 20px",
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
            <img src="/logo.svg" alt="SportSphere HQ" width={28} height={28} style={{ width: 28, height: 28, flexShrink: 0 }} />
            <span className="nav-logo-label" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "#f0f0f0", lineHeight: 1, whiteSpace: "nowrap" }}>
              Sport<span style={{ color: "#f97316" }}>Sphere</span> HQ
            </span>
          </Link>

          {/* Left — sport links */}
          <div className="nav-centre" style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
            {LEFT_LINKS.map(link => {
              const active = isActive(link);
              return (
                <Link key={link.href} href={link.href} style={linkStyle(active)}>
                  {link.label}
                  {link.badge && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#000", background: "#4ade80", borderRadius: 3, padding: "1px 4px", letterSpacing: "0.04em", lineHeight: 1.5 }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right — conditional on auth/pro status */}
          <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>

            {isPro ? (
              /* Pro user: show tool links */
              <>
                {PRO_RIGHT_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={(link as { hideUnder1280?: boolean }).hideUnder1280 ? "nav-hide-1280" : undefined}
                    style={linkStyle(pathname === link.href)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div style={{ width: 1, height: 16, background: "#1f1f1f", margin: "0 4px" }} className="nav-hide-1024" />
                <Link href="/dashboard" className="nav-hide-1024" style={{ fontSize: 12, color: "#555", textDecoration: "none", padding: "4px 8px" }}>
                  {userEmail?.split("@")[0]}
                </Link>
                <span className="nav-hide-1024" style={{ fontSize: 9, fontWeight: 800, color: "#000", background: "#22c55e", borderRadius: 3, padding: "1px 5px" }}>PRO</span>
                <button
                  onClick={() => signOut()}
                  className="nav-hide-1024"
                  style={{ fontSize: 12, color: "#555", background: "none", border: "1px solid #1f1f1f", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </>
            ) : isLoggedIn ? (
              /* Logged in, not Pro */
              <>
                {FREE_RIGHT_LINKS.map(link => (
                  <Link key={link.href} href={link.href} className="nav-hide-1280" style={linkStyle(pathname === link.href)}>
                    {link.label}
                  </Link>
                ))}
                <div style={{ width: 1, height: 16, background: "#1f1f1f", margin: "0 4px" }} className="nav-hide-1024" />
                <Link href="/dashboard" className="nav-hide-1024" style={{ fontSize: 12, color: "#555", textDecoration: "none", padding: "4px 8px" }}>
                  {userEmail?.split("@")[0]}
                </Link>
                <Link href="/auth/payment" className="nav-hide-1024" style={{ fontSize: 13, fontWeight: 700, color: "#000", background: "#f97316", textDecoration: "none", borderRadius: 6, padding: "5px 12px", whiteSpace: "nowrap" }}>
                  Upgrade
                </Link>
              </>
            ) : (
              /* Logged out */
              <>
                {FREE_RIGHT_LINKS.map(link => (
                  <Link key={link.href} href={link.href} className="nav-hide-1280" style={linkStyle(pathname === link.href)}>
                    {link.label}
                  </Link>
                ))}
                <Link href="/login" className="nav-hide-1024" style={{ fontSize: 13, color: "#777", textDecoration: "none", padding: "5px 10px" }}>
                  Sign In
                </Link>
                <Link href="/auth/payment" className="nav-hide-1024" style={{ fontSize: 13, fontWeight: 700, color: "#000", background: "#f97316", textDecoration: "none", borderRadius: 6, padding: "5px 14px", whiteSpace: "nowrap" }}>
                  Get Pro
                </Link>
              </>
            )}

            {/* Hamburger */}
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
                <div key={i} style={{ width: 18, height: 1.5, background: "#666", borderRadius: 1 }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: 260,
              background: "#080808",
              borderLeft: "1px solid #111",
              padding: "72px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 11, color: "#777" }}>Round {round} · 2026</span>
              {isPro && <span style={{ ...proBadge, background: "#22c55e" }}>PRO</span>}
            </div>
            {ALL_MOBILE_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 700 : 400,
                    color: active ? "#f97316" : "#888",
                    textDecoration: "none",
                    padding: "11px 0",
                    borderBottom: "1px solid #0f0f0f",
                    display: "flex", alignItems: "center", gap: 7,
                  }}
                >
                  {link.label}
                  {(link as { badge?: string }).badge && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#000", background: "#4ade80", borderRadius: 3, padding: "1px 4px" }}>
                      {(link as { badge: string }).badge}
                    </span>
                  )}
                  {(link as { isPro?: boolean }).isPro && (
                    <span style={proBadge}>PRO</span>
                  )}
                </Link>
              );
            })}
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: 14, color: "#666", textDecoration: "none", padding: "11px 0", borderBottom: "1px solid #0f0f0f" }}>
                  Dashboard ({userEmail?.split("@")[0]})
                </Link>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  style={{ fontSize: 14, color: "#555", background: "none", border: "1px solid #1f1f1f", borderRadius: 5, padding: "10px 0", cursor: "pointer", marginTop: 14, textAlign: "left" }}
                >
                  Sign Out
                </button>
                {!isPro && (
                  <Link href="/auth/payment" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: 12, background: "#f97316", color: "#000", fontWeight: 800, fontSize: 14, textDecoration: "none", borderRadius: 6, padding: "12px 16px", textAlign: "center" }}>
                    Upgrade to Pro →
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: "#888", textDecoration: "none", padding: "11px 0", borderBottom: "1px solid #0f0f0f" }}>
                  Sign In
                </Link>
                <Link href="/auth/payment" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: 12, background: "#f97316", color: "#000", fontWeight: 800, fontSize: 14, textDecoration: "none", borderRadius: 6, padding: "12px 16px", textAlign: "center" }}>
                  Get Pro - $29/month
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pro toast */}
      {showProToast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: "#22c55e", color: "#000", fontWeight: 700,
          fontSize: 14, padding: "12px 20px",
          borderRadius: 10, boxShadow: "0 4px 24px rgba(34,197,94,0.3)",
          zIndex: 300, letterSpacing: "-0.01em",
        }}>
          Pro access active
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
