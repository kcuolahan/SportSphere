'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProAccess } from '@/lib/auth'

const AFL_NAV = [
  {
    label: 'Picks',
    href: '/predictions',
    icon: '🎯',
    pro: false,
    desc: 'This round HC picks',
  },
  {
    label: 'Track Record',
    href: '/accuracy',
    icon: '📊',
    pro: true,
    desc: '67.6% HC win rate',
  },
  {
    label: 'DvP Rankings',
    href: '/defence',
    icon: '🛡',
    pro: true,
    desc: 'Team matchup data',
  },
  {
    label: 'Player Explorer',
    href: '/players',
    icon: '👤',
    pro: false,
    desc: '535 players tracked',
  },
  {
    label: 'Simulator',
    href: '/simulator',
    icon: '⚙',
    pro: true,
    desc: 'Test model weights',
  },
]

export function AFLSidebar() {
  const pathname = usePathname()
  const { isPro, isLoggedIn } = useProAccess()

  return (
    <div className="w-56 min-h-screen bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col py-6 px-3 shrink-0">
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

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {AFL_NAV.map((item) => {
          const isActive = pathname === item.href
          const isLocked = item.pro && !isPro

          return (
            <Link
              key={item.href}
              href={isLocked ? '/auth/payment' : item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                ${isActive
                  ? 'bg-[#f97316]/10 border border-[#f97316]/30'
                  : 'hover:bg-[#1a1a1a] border border-transparent'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    isActive ? 'text-[#f97316]' : 'text-white'
                  }`}>
                    {item.label}
                  </span>
                  {item.pro && !isPro && (
                    <span className="text-[10px] bg-[#f97316] text-black font-black px-1 rounded">
                      PRO
                    </span>
                  )}
                </div>
                <div className="text-[#555] text-xs truncate">{item.desc}</div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Upgrade or Pro Status */}
      <div className="mt-6 px-3">
        {!isLoggedIn && (
          <Link
            href="/auth/payment"
            className="block w-full bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm py-3 px-4 rounded-lg text-center"
          >
            Get Pro — $29/month
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
        {isPro && (
          <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-lg p-3 text-center">
            <div className="text-[#4ade80] font-black text-sm">Pro Active</div>
            <div className="text-[#555] text-xs mt-1">Full access</div>
          </div>
        )}
      </div>
    </div>
  )
}
