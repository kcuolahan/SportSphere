'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useProAccess } from '@/lib/auth'

export default function Nav() {
  const pathname = usePathname()
  const { isPro, isLoggedIn, loading, userEmail, signOut } = useProAccess()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/afl', label: 'AFL' },
    { href: '/model', label: 'How It Works' },
    { href: '/faq', label: 'FAQ' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1a1a1a] h-14">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="bg-[#f97316] text-black font-black text-sm px-2 py-1 rounded">SS</span>
            <span className="font-black text-white hidden sm:block">SportSphere</span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-[#f97316]'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {!isLoggedIn && (
                  <>
                    <Link
                      href="/login"
                      className="hidden sm:block text-[#888] hover:text-white text-sm font-medium px-3 py-1.5"
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
                    <span className="hidden sm:block text-[#555] text-xs truncate max-w-[120px]">{userEmail}</span>
                    <Link
                      href="/auth/payment"
                      className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm px-4 py-2 rounded-lg"
                    >
                      Upgrade
                    </Link>
                    <button onClick={signOut} className="hidden sm:block text-[#555] hover:text-white text-sm">
                      Sign Out
                    </button>
                  </>
                )}

                {isLoggedIn && isPro && (
                  <>
                    <span className="bg-[#4ade80] text-black text-xs font-black px-2 py-0.5 rounded">PRO</span>
                    <span className="hidden sm:block text-[#555] text-xs truncate max-w-[120px]">{userEmail}</span>
                    <button onClick={signOut} className="text-[#555] hover:text-white text-sm">
                      Sign Out
                    </button>
                  </>
                )}
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden border border-[#1a1a1a] rounded p-1.5 ml-1"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-black/70" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-0 right-0 bottom-0 w-64 bg-[#080808] border-l border-[#111] pt-20 px-6 pb-8 flex flex-col gap-1 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 border-b border-[#0f0f0f] text-[15px] ${
                  pathname === link.href ? 'text-[#f97316] font-bold' : 'text-[#888]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <div className="text-sm text-[#555] py-3 border-b border-[#0f0f0f]">{userEmail}</div>
                {isPro && (
                  <div className="py-2">
                    <span className="bg-[#4ade80] text-black text-xs font-black px-2 py-0.5 rounded">PRO ACTIVE</span>
                  </div>
                )}
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

      {/* Spacer so content doesn't hide under fixed nav */}
      <div className="h-14" />
    </>
  )
}
