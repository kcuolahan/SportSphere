'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'

export default function NBAPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-1.5 mb-6">
            <span className="bg-[#2a2a2a] text-[#888] text-xs font-black px-2 py-0.5 rounded uppercase">
              Oct 2026
            </span>
            <span className="text-[#888] text-sm">NBA Season Launch</span>
          </div>

          <h1 className="text-5xl font-black mb-4">NBA Player Props</h1>
          <p className="text-xl text-[#888] max-w-2xl leading-relaxed">
            Points, assists and rebounds predictions powered by XGBoost ensemble models.
            Same Edge/Vol methodology as AFL. Early access for Pro subscribers.
          </p>
        </div>

        {/* Model Architecture */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-[#f97316] font-bold text-xs uppercase tracking-wider mb-4">
              Model Architecture
            </div>
            <div className="space-y-3">
              {[
                { label: 'Algorithm', value: 'XGBoost Ensemble' },
                { label: 'ELO Ratings', value: 'Team + Player' },
                { label: 'Fatigue Factor', value: 'Back-to-back + travel' },
                { label: 'Four Factors', value: 'eFG%, TOV%, ORB%, FT/FGA' },
                { label: 'Rolling Avgs', value: '7, 14, 30 day windows' },
                { label: 'Home/Away', value: 'Split performance model' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#111] last:border-0">
                  <span className="text-[#666] text-sm">{item.label}</span>
                  <span className="text-white text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-[#f97316] font-bold text-xs uppercase tracking-wider mb-4">
              Expected Performance
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[#4ade80] font-black text-3xl">68–72%</div>
                <div className="text-[#666] text-sm">Projected HC win rate</div>
                <div className="text-[#444] text-xs mt-1">Based on 2022-24 backtesting</div>
              </div>
              <div className="border-t border-[#111] pt-4">
                <div className="text-white font-black text-2xl">450+</div>
                <div className="text-[#666] text-sm">Projected picks per season</div>
              </div>
              <div className="border-t border-[#111] pt-4">
                <div className="text-[#888] text-sm">Same E/V ≥ 0.50 filter as AFL</div>
                <div className="text-[#444] text-xs mt-1">HC tier: only statistically significant edges</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Pick Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-12">
          <div className="text-[#888] text-xs font-bold uppercase tracking-wider mb-4">
            Sample Model Output — Not a real pick
          </div>

          <div className="bg-[#0a0a0a] border border-[#f97316]/20 rounded-lg p-5 relative overflow-hidden">
            {/* Blur overlay for locked state */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-[#0a0a0a]/60 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="bg-[#f97316] text-black font-black text-sm px-4 py-2 rounded-lg mb-2">
                  LOCKED — Coming Oct 2026
                </div>
                <div className="text-[#555] text-xs">Pro subscribers get early access</div>
              </div>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-black text-xl">Nikola Jokic</div>
                <div className="text-[#888] text-sm">DEN · C</div>
              </div>
              <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 rounded px-2 py-1">
                <div className="text-[#4ade80] font-black text-xs">HC TIER</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#111] rounded p-3">
                <div className="text-[#888] text-xs mb-1">Prop Line</div>
                <div className="font-black text-lg">25.5 pts</div>
                <div className="text-[#f97316] text-sm font-bold">OVER</div>
              </div>
              <div className="bg-[#111] rounded p-3">
                <div className="text-[#888] text-xs mb-1">Model</div>
                <div className="font-black text-lg">28.3</div>
                <div className="text-[#4ade80] text-xs">+2.8 edge</div>
              </div>
              <div className="bg-[#111] rounded p-3">
                <div className="text-[#888] text-xs mb-1">E/V Score</div>
                <div className="font-black text-lg">0.73</div>
                <div className="text-[#4ade80] text-xs">≥ 0.50 ✓</div>
              </div>
            </div>

            <div className="text-[#444] text-xs">
              vs LAL · Home · 3rd game in 5 days · Jokic avg 27.1 pts last 14 days
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-12">
          <div className="text-[#f97316] font-bold text-xs uppercase tracking-wider mb-4">
            Data Pipeline
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'nba_api',
                desc: 'Free official NBA stats API. No authentication required. Live game logs, player splits, team stats.',
              },
              {
                title: 'Same Edge/Vol',
                desc: 'Identical HC tier filtering as AFL model. E/V ≥ 0.50 threshold. Only statistically significant signals published.',
              },
              {
                title: 'Automated Pipeline',
                desc: 'Daily stat ingestion. Lines pulled from bookmakers each morning. Picks generated and published before games.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] rounded-lg p-4">
                <div className="font-black text-sm mb-2">{item.title}</div>
                <div className="text-[#666] text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist */}
        <div className="bg-[#1a1a1a] border border-[#f97316]/20 rounded-xl p-8 text-center mb-8">
          <div className="text-[#4ade80] font-black text-4xl mb-2">147</div>
          <div className="text-[#888] text-sm mb-6">people on the NBA waitlist</div>
          <h2 className="text-2xl font-black mb-3">Get early access</h2>
          <p className="text-[#888] mb-6">
            Pro subscribers get NBA access automatically when it launches.
            No extra charge — included in your $29/month.
          </p>
          <Link
            href="/auth/payment"
            className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-black font-black px-8 py-4 rounded-lg text-lg"
          >
            Get Pro — $29/month
          </Link>
          <p className="text-[#555] text-xs mt-3">AFL live now · NBA + NFL included when they launch</p>
        </div>

        {/* Back to AFL */}
        <div className="text-center">
          <Link href="/predictions" className="text-[#f97316] font-bold hover:underline">
            ← Back to AFL Picks
          </Link>
        </div>

      </div>
    </div>
  )
}
