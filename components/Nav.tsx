'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useProAccess } from '@/lib/auth'

export default function Nav() {
  const pathname = usePathname()
  const { isPro, isLoggedIn, loading, userEmail, signOut } = useProAccess()
  const [currentRound, setCurrentRound] = useState(8)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/current-round')
      .then(r => r.json())
      .then(d => setCurrentRound(d.round || 8))
      .catch(() => {})
  }, [])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="bg-[#f97316] text-black font-black text-sm px-2 py-1 rounded">SS</span>
            <span className="font-black text-white hidden sm:block">SportSphere</span>
          </Link>

          {/* Sport Nav - Center */}
          <div className="hidden md:flex items-center gap-1 mx-4">
            {[
              { href: '/afl', label: 'AFL', live: true },
              { href: '/nba', label: 'NBA', live: false },
              { href: '/nfl', label: 'NFL', live: false },
              { href: '/fantasy', label: 'Fantasy', live: false },
            ].map((sport) => (
              <Link
                key={sport.href}
                href={sport.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
                  ${pathname === sport.href || pathname.startsWith(sport.href + '/')
                    ? 'text-[#f97316]'
                    : 'text-[#888] hover:text-white'
                  }
                `}
              >
                {sport.label}
                {sport.live && (
                  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Round indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#555] border border-[#1a1a1a] rounded px-2 py-1">
              <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full"></span>
              R{currentRound} · 2026
            </div>

            {loading ? null : (
              <>
                {!isLoggedIn && (
                  <>
                    <Link
                      href="/login"
                      className="text-[#888] hover:text-white text-sm font-medium hidden sm:block"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/payment"
                      className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm px-4 py-2 rounded-lg"
                    >
                      Get Pro
                    </Link>
                  </>
                )}

                {isLoggedIn && !isPro && (
                  <>
                    <span className="text-[#555] text-xs hidden sm:block truncate max-w-32">
                      {userEmail}
                    </span>
                    <Link
                      href="/auth/payment"
                      className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm px-4 py-2 rounded-lg"
                    >
                      Upgrade
                    </Link>
                  </>
                )}

                {isLoggedIn && isPro && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#4ade80] text-black text-xs font-black px-2 py-0.5 rounded">
                        PRO
                      </span>
                      <span className="text-[#555] text-xs hidden sm:block truncate max-w-32">
                        {userEmail}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className="text-[#555] hover:text-white text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden border border-[#1a1a1a] rounded p-1.5"
              aria-label="Open menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <span className="block h-0.5 bg-[#666] rounded"></span>
                <span className="block h-0.5 bg-[#666] rounded"></span>
                <span className="block h-0.5 bg-[#666] rounded"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/70"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 right-0 bottom-0 w-64 bg-[#080808] border-l border-[#111] pt-20 px-6 pb-8 flex flex-col gap-1 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-[#4ade80] rounded-full"></span>
              <span className="text-xs text-[#555]">Round {currentRound} · 2026</span>
              {isPro && (
                <span className="text-[9px] font-black bg-[#4ade80] text-black px-1.5 py-0.5 rounded">PRO</span>
              )}
            </div>

            {[
              { href: '/afl', label: 'AFL' },
              { href: '/nba', label: 'NBA' },
              { href: '/nfl', label: 'NFL' },
              { href: '/fantasy', label: 'Fantasy' },
              { href: '/predictions', label: 'Picks (AFL)' },
              { href: '/players', label: 'Player Explorer' },
              { href: '/model', label: 'How It Works' },
              { href: '/accuracy', label: 'Track Record', isPro: true },
              { href: '/defence', label: 'DvP Rankings', isPro: true },
              { href: '/simulator', label: 'Simulator', isPro: true },
              { href: '/betslip', label: 'Betslip', isPro: true },
              { href: '/archive', label: 'Archive', isPro: true },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 py-3 border-b border-[#0f0f0f] text-[15px] ${
                  pathname === link.href ? 'text-[#f97316] font-bold' : 'text-[#888]'
                }`}
              >
                {link.label}
                {(link as { isPro?: boolean }).isPro && (
                  <span className="text-[9px] font-black bg-[#f97316] text-black px-1 rounded">PRO</span>
                )}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <div className="text-sm text-[#555] py-3 border-b border-[#0f0f0f]">
                  {userEmail}
                </div>
                {!isPro && (
                  <Link
                    href="/auth/payment"
                    onClick={() => setMobileOpen(false)}
                    className="block mt-3 bg-[#f97316] text-black font-black text-sm rounded-lg py-3 px-4 text-center"
                  >
                    Upgrade to Pro →
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="mt-3 text-sm text-[#555] text-left py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-[#0f0f0f] text-[15px] text-[#888]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/payment"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-3 bg-[#f97316] text-black font-black text-sm rounded-lg py-3 px-4 text-center"
                >
                  Get Pro — $29/month
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
