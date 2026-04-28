'use client'
import Link from 'next/link'
import { useStats } from '@/lib/useStats'

export default function HomePage() {
  const stats = useStats('AFL')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></span>
            <span className="text-[#f97316] text-sm font-semibold">
              AFL Round 8 picks are live
            </span>
          </div>
          <h1 className="text-6xl font-black leading-none mb-6">
            Sports analytics<br />
            <span className="text-[#f97316]">with a real edge.</span>
          </h1>
          <p className="text-xl text-[#888] mb-10 max-w-2xl leading-relaxed">
            Predictive models built by a financial analyst.
            Verified track records. No black boxes.
            Starting with AFL disposal markets. NBA and NFL coming soon.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/afl"
              className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-lg px-8 py-4 rounded-lg"
            >
              Explore AFL Analytics
            </Link>
            <Link
              href="/model"
              className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f97316]/30 font-bold text-lg px-8 py-4 rounded-lg"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      {/* SPORT TILES */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">

          {/* AFL - LIVE */}
          <Link href="/afl" className="group">
            <div className="bg-[#1a1a1a] border border-[#f97316]/30 hover:border-[#f97316] rounded-xl p-6 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-[#f97316]">AFL</span>
                <span className="bg-[#4ade80] text-black text-xs font-black px-2 py-1 rounded uppercase">
                  Live
                </span>
              </div>
              <div className="text-white font-bold text-lg mb-2">
                Disposal Analytics
              </div>
              <div className="text-[#888] text-sm mb-6">
                Six-factor weighted model with Edge/Vol filtering.
                Every pick verified against official data.
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-[#4ade80] font-black text-xl">
                    {stats.hc.winRatePct}%
                  </div>
                  <div className="text-[#666] text-xs">HC Win Rate</div>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-[#f97316] font-black text-xl">
                    ${(stats.hc.grossPL / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[#666] text-xs">Gross P&L</div>
                </div>
              </div>
              <div className="text-[#f97316] font-bold text-sm group-hover:underline">
                Explore AFL →
              </div>
            </div>
          </Link>

          {/* NBA - COMING SOON */}
          <Link href="/nba" className="group">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#888]/30 rounded-xl p-6 transition-all h-full opacity-70 hover:opacity-90">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-[#888]">NBA</span>
                <span className="bg-[#2a2a2a] text-[#888] text-xs font-black px-2 py-1 rounded uppercase">
                  Oct 2026
                </span>
              </div>
              <div className="text-white font-bold text-lg mb-2">
                Player Props
              </div>
              <div className="text-[#888] text-sm mb-6">
                Points, assists and rebounds predictions.
                XGBoost ensemble with ELO ratings and fatigue factors.
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-[#888] font-black text-xl">82</div>
                  <div className="text-[#666] text-xs">Games/Season</div>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-[#888] font-black text-xl">450+</div>
                  <div className="text-[#666] text-xs">Projected picks</div>
                </div>
              </div>
              <div className="text-[#666] font-bold text-sm">
                Join waitlist →
              </div>
            </div>
          </Link>

          {/* NFL - COMING SOON */}
          <Link href="/nfl" className="group">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#888]/30 rounded-xl p-6 transition-all h-full opacity-70 hover:opacity-90">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-[#888]">NFL</span>
                <span className="bg-[#2a2a2a] text-[#888] text-xs font-black px-2 py-1 rounded uppercase">
                  Sep 2026
                </span>
              </div>
              <div className="text-white font-bold text-lg mb-2">
                Player Props
              </div>
              <div className="text-[#888] text-sm mb-6">
                Receiving yards, rushing yards, touchdowns.
                Same Edge/Vol methodology applied to NFL markets.
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-[#888] font-black text-xl">18</div>
                  <div className="text-[#666] text-xs">Weeks/Season</div>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-[#888] font-black text-xl">320+</div>
                  <div className="text-[#666] text-xs">Projected picks</div>
                </div>
              </div>
              <div className="text-[#666] font-bold text-sm">
                Join waitlist →
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* FANTASY TEASER */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[#f97316] font-bold text-sm uppercase tracking-wider mb-2">
                Coming 2027
              </div>
              <h2 className="text-2xl font-black mb-2">
                SportSphere Fantasy
              </h2>
              <p className="text-[#888] max-w-lg">
                Cross-sport fantasy with XP progression. Draft AFL, NBA and NFL players
                in one season-long competition. Use the model to beat your mates.
              </p>
            </div>
            <Link
              href="/fantasy"
              className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f97316]/30 font-bold px-6 py-3 rounded-lg whitespace-nowrap"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-black mb-10 text-center">
          Built differently
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              title: 'Financial analyst methodology',
              desc: 'Edge identification, probability weighting, position sizing. The same framework used for equities research.',
            },
            {
              title: 'Edge/Vol filtering',
              desc: 'Every pick scored by edge divided by volatility. Only statistically meaningful signals published.',
            },
            {
              title: 'Verified results',
              desc: 'Every pick logged before games start. Every result verified against official data. No cherry picking.',
            },
            {
              title: 'Transparent methodology',
              desc: 'The model is explained, not hidden. You know exactly why each pick was made.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <div className="text-[#f97316] font-black text-sm mb-3">0{i + 1}</div>
              <div className="font-bold mb-2">{item.title}</div>
              <div className="text-[#888] text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LATEST RESULTS */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[#888] text-sm font-semibold uppercase tracking-wider mb-1">
                Latest Results
              </div>
              <h2 className="text-2xl font-black">Round 7 · 2026</h2>
              <div className="text-[#888] text-sm mt-1">
                12 picks tracked — 10W / 2L
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#4ade80] font-black text-4xl">83.3%</div>
              <div className="text-[#666] text-sm">Round win rate</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { name: 'Nick Daicos', result: 'WIN', stat: '42 disposals', color: 'text-[#4ade80]' },
              { name: 'Zak Butters', result: 'WIN', stat: '30 disposals', color: 'text-[#4ade80]' },
              { name: 'Callum Wilkie', result: 'WIN', stat: '25 disposals', color: 'text-[#4ade80]' },
              { name: 'Elliot Yeo', result: 'LOSS', stat: '21 disposals', color: 'text-red-400' },
            ].map((pick, i) => (
              <div key={i} className="bg-[#0a0a0a] rounded-lg p-4">
                <div className="font-bold text-sm mb-1">{pick.name}</div>
                <div className={`font-black text-sm ${pick.color}`}>{pick.result}</div>
                <div className="text-[#555] text-xs mt-1">{pick.stat}</div>
              </div>
            ))}
          </div>
          <Link
            href="/accuracy"
            className="text-[#f97316] font-bold text-sm hover:underline"
          >
            Full track record →
          </Link>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-4xl font-black mb-4">
          Start with AFL.
        </h2>
        <p className="text-[#888] text-xl mb-8">
          $29/month for the AFL season. NBA and NFL included when they launch.
        </p>
        <Link
          href="/auth/payment"
          className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-xl px-16 py-5 rounded-xl"
        >
          Get Pro — $29/month
        </Link>
        <p className="text-[#555] text-sm mt-4">
          Cancel anytime. All sports included as they launch.
        </p>
      </div>

    </div>
  )
}
