'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useProAccess } from '@/lib/auth'
import { useStats } from '@/lib/useStats'
import Footer from '@/components/Footer'

const FEATURES = [
  {
    title: 'This Week\'s Picks',
    desc: 'HC picks with Edge/Vol scores. Free pick every round.',
    href: '/predictions',
    pro: false,
    badge: 'LIVE',
    badgeColor: 'bg-[#4ade80] text-black',
  },
  {
    title: 'Track Record',
    desc: '67.6% HC win rate across R3–R7. Every result verified.',
    href: '/accuracy',
    pro: true,
  },
  {
    title: 'DvP Rankings',
    desc: 'Which teams concede most to each position.',
    href: '/defence',
    pro: true,
  },
  {
    title: 'Player Explorer',
    desc: '535 players tracked with model outputs.',
    href: '/players',
    pro: false,
  },
  {
    title: 'Model Simulator',
    desc: 'Adjust weights, see how accuracy changes.',
    href: '/simulator',
    pro: true,
  },
]

export default function AFLPage() {
  const { isPro } = useProAccess()
  const stats = useStats('AFL')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      {/* AFL Header */}
      <div className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black">AFL Disposal Analytics</h1>
                <span className="bg-[#4ade80] text-black text-xs font-black px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-[#888]">2026 Season · Round 8 · Six-factor weighted model</p>
            </div>
            {!isPro && (
              <Link
                href="/auth/payment"
                className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black px-6 py-3 rounded-lg"
              >
                Get Pro — $29/month
              </Link>
            )}
            {isPro && (
              <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-lg px-4 py-2 text-center">
                <div className="text-[#4ade80] font-black text-sm">Pro Active</div>
                <div className="text-[#555] text-xs">Full access enabled</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-8">
            {[
              { label: 'HC Win Rate', value: `${stats.hc.winRatePct}%`, color: 'text-[#4ade80]' },
              { label: 'Gross P&L', value: `+$${stats.hc.grossPL.toLocaleString()}`, color: 'text-[#4ade80]' },
              { label: 'HC Picks', value: stats.hc.totalPicks.toString(), color: 'text-white' },
              { label: 'ROI', value: `${stats.hc.roiPct}%`, color: 'text-[#f97316]' },
              { label: 'Verified', value: 'R3–R7 · 2026', color: 'text-[#555]' },
            ].map(stat => (
              <div key={stat.label}>
                <div className={`font-black text-xl ${stat.color}`}>{stat.value}</div>
                <div className="text-[#555] text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feature => {
            const isLocked = feature.pro && !isPro
            return (
              <Link
                key={feature.href}
                href={isLocked ? '/auth/payment' : feature.href}
                className={`bg-[#1a1a1a] border rounded-xl p-5 transition-all group ${
                  isLocked
                    ? 'border-[#2a2a2a] hover:border-[#3a3a3a] opacity-80'
                    : 'border-[#2a2a2a] hover:border-[#f97316]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm">{feature.title}</span>
                  <div className="flex gap-1">
                    {feature.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${feature.badgeColor}`}>
                        {feature.badge}
                      </span>
                    )}
                    {feature.pro && (
                      <span className="text-[10px] bg-[#f97316] text-black font-black px-1.5 py-0.5 rounded">PRO</span>
                    )}
                  </div>
                </div>
                <p className="text-[#666] text-xs leading-relaxed mb-3">{feature.desc}</p>
                <div className={`text-xs font-bold ${isLocked ? 'text-[#f97316]' : 'text-[#888] group-hover:text-white'}`}>
                  {isLocked ? 'Unlock with Pro →' : 'Open →'}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick link to picks */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-[#1a1a1a] border border-[#f97316]/20 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[#f97316] text-xs font-bold uppercase tracking-wider mb-1">Round 8 · Live Now</div>
            <h2 className="text-xl font-black mb-1">This week&apos;s picks are ready</h2>
            <p className="text-[#666] text-sm">9 HC signals + 6 BET signals. Tristan Xerri free pick visible to all.</p>
          </div>
          <Link
            href="/predictions"
            className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black px-6 py-3 rounded-lg whitespace-nowrap"
          >
            See Picks →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
