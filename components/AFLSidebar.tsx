'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useProAccess } from '@/lib/auth'

const AFL_NAV = [
  { label: "This Week's Picks", href: '/predictions', pro: false },
  { label: 'Track Record', href: '/accuracy', pro: true },
  { label: 'DvP Rankings', href: '/defence', pro: true },
  { label: 'Player Explorer', href: '/players', pro: false },
  { label: 'Model Simulator', href: '/simulator', pro: true },
  { label: 'How It Works', href: '/model', pro: false },
]

export function AFLSidebar() {
  const pathname = usePathname()
  const { isPro, isLoggedIn } = useProAccess()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile hamburger — only shown on mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-[60px] left-3 z-30 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 flex items-center gap-2"
        aria-label="Open AFL menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#888]">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span className="text-[#f97316] font-bold text-xs">AFL Menu</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col py-6 px-3',
          'transition-transform duration-300 ease-out',
          // Mobile: fixed overlay
          'fixed top-14 left-0 bottom-0 z-50 w-72',
          // Desktop: static in flow
          'lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:w-56 lg:min-h-[calc(100vh-56px)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-3 right-3 text-[#666] hover:text-white p-1"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* AFL Header */}
        <div className="mb-6 px-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#f97316] font-black text-lg">AFL</span>
            <span className="bg-[#4ade80] text-black text-xs font-black px-1.5 py-0.5 rounded uppercase">
              Live
            </span>
          </div>
          <div className="text-[#555] text-xs">2026 Season · Round 8</div>
        </div>

        {/* Pro status pill */}
        {isPro && (
          <div className="mx-3 mb-4 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-lg p-2 text-center">
            <div className="text-[#4ade80] font-bold text-xs">PRO ACTIVE</div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {AFL_NAV.map((item) => {
            const isActive = pathname === item.href
            const isLocked = item.pro && !isPro

            return (
              <Link
                key={item.href}
                href={isLocked ? '/auth/payment' : item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-[#f97316]/10 border border-[#f97316]/30'
                    : 'hover:bg-[#1a1a1a] border border-transparent',
                ].join(' ')}
              >
                <span className={`text-sm font-semibold ${isActive ? 'text-[#f97316]' : 'text-white'}`}>
                  {item.label}
                </span>
                {item.pro && !isPro && (
                  <span className="text-[10px] bg-[#f97316] text-black font-black px-1.5 py-0.5 rounded shrink-0">
                    PRO
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom CTA */}
        <div className="mt-6 px-3">
          {!isLoggedIn && (
            <Link
              href="/auth/payment"
              className="block w-full bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm py-3 px-4 rounded-lg text-center"
            >
              Get Pro — $29/mo
            </Link>
          )}
          {isLoggedIn && !isPro && (
            <Link
              href="/auth/payment"
              className="block w-full bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm py-3 px-4 rounded-lg text-center"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
