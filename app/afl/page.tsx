'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useProAccess } from '@/lib/auth'
import { useStats } from '@/lib/useStats'

export default function AFLPage() {
  const { isPro } = useProAccess()
  const stats = useStats('AFL')

  const features = [
    {
      title: 'Round 8 Picks',
      desc: 'High Conviction picks with Edge/Vol scores',
      href: '/predictions',
      pro: false,
      badge: 'LIVE',
      badgeColor: 'bg-[#4ade80] text-black',
    },
    {
      title: 'Track Record',
      desc: `${stats.hc.winRatePct}% HC win rate across ${stats.hc.totalPicks} picks`,
      href: '/accuracy',
      pro: true,
    },
    {
      title: 'DvP Rankings',
      desc: 'Which teams concede most to each position',
      href: '/defence',
      pro: true,
    },
    {
      title: 'Player Explorer',
      desc: '535 players tracked with model outputs',
      href: '/players',
      pro: false,
    },
    {
      title: 'Model Simulator',
      desc: 'Adjust weights, see how accuracy changes',
      href: '/simulator',
      pro: true,
    },
    {
      title: 'Betslip Calculator',
      desc: 'Kelly Criterion stake sizing per pick',
      href: '/betslip',
      pro: true,
    },
    {
      title: 'Round Preview',
      desc: 'Key matchups and model watch list',
      href: '/round-preview',
      pro: true,
    },
    {
      title: 'Pick Archive',
      desc: 'Every HC pick ever made, searchable',
      href: '/archive',
      pro: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      {/* AFL Header */}
      <div className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-6 pt-20 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-[#555] text-sm mb-2">
            <Link href="/" className="hover:text-[#888]">SportSphere</Link>
            {' / '}
            <span className="text-white">AFL</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black">AFL Disposal Analytics</h1>
                <span className="bg-[#4ade80] text-black text-xs font-black px-2 py-1 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-[#888]">
                2026 Season · Round 8 · Six-factor weighted model
              </p>
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
                <div className="text-[#4ade80] font-black">Pro Active</div>
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
              { label: 'Season', value: 'R3 to R7 verified', color: 'text-[#555]' },
            ].map((stat, i) => (
              <div key={i}>
                <div className={`font-black text-xl ${stat.color}`}>{stat.value}</div>
                <div className="text-[#555] text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const isLocked = feature.pro && !isPro
            return (
              <Link
                key={feature.href}
                href={isLocked ? '/auth/payment' : feature.href}
                className={`
                  bg-[#1a1a1a] border rounded-xl p-5 transition-all group
                  ${isLocked
                    ? 'border-[#2a2a2a] hover:border-[#3a3a3a] opacity-75'
                    : 'border-[#2a2a2a] hover:border-[#f97316]/40'
                  }
                `}
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
                      <span className="text-[10px] bg-[#f97316] text-black font-black px-1.5 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[#666] text-xs leading-relaxed">
                  {feature.desc}
                </p>
                <div className={`mt-3 text-xs font-bold ${isLocked ? 'text-[#f97316]' : 'text-[#888] group-hover:text-white'}`}>
                  {isLocked ? 'Unlock with Pro →' : 'Open →'}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Current Picks Preview */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[#f97316] text-xs font-bold uppercase tracking-wider mb-1">
                Round 8 · Live Now
              </div>
              <h2 className="text-xl font-black">High Conviction Picks</h2>
            </div>
            <Link href="/predictions" className="text-[#f97316] font-bold text-sm hover:underline">
              View all picks →
            </Link>
          </div>

          {/* 1 free pick shown */}
          <div className="bg-[#0a0a0a] border border-[#f97316]/20 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-black">Zak Butters</div>
                <div className="text-[#888] text-sm">PTA · MID</div>
              </div>
              <div className="text-right">
                <div className="text-[#f97316] font-black">OVER 23.5</div>
                <div className="text-[#4ade80] text-sm">E/V 1.17</div>
              </div>
            </div>
          </div>

          {!isPro && (
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
              <div className="text-[#555] text-sm">
                More HC picks available for Pro subscribers
              </div>
              <Link
                href="/auth/payment"
                className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm px-4 py-2 rounded"
              >
                Unlock All
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
