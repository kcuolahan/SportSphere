'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      {/* HERO */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></span>
            <span className="text-[#f97316] text-sm font-semibold">AFL 2026 — Round 8 picks are live</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-none mb-6">
            AFL disposal analytics<br />
            <span className="text-[#f97316]">with a verified edge.</span>
          </h1>
          <p className="text-xl text-[#888] mb-4 max-w-2xl leading-relaxed">
            67.6% HC win rate. 71 picks tracked. $18,760 gross profit.
          </p>
          <p className="text-base text-[#555] mb-10 max-w-xl">
            A six-factor model built by a financial analyst. Every pick logged before the game. Every result verified against official AFL data.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/predictions"
              className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-lg px-8 py-4 rounded-lg"
            >
              See This Week&apos;s Picks
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

      {/* LATEST RESULTS */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[#888] text-sm font-semibold uppercase tracking-wider mb-1">Last Round Results</div>
              <h2 className="text-2xl font-black">Round 7 · 2026</h2>
              <div className="text-[#888] text-sm mt-1">12 picks tracked — 10W / 2L</div>
            </div>
            <div className="text-right">
              <div className="text-[#4ade80] font-black text-4xl">83.3%</div>
              <div className="text-[#666] text-sm">Round win rate</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { name: 'Nick Daicos', result: 'WIN', stat: '42 disposals', win: true },
              { name: 'Zak Butters', result: 'WIN', stat: '30 disposals', win: true },
              { name: 'Callum Wilkie', result: 'WIN', stat: '25 disposals', win: true },
              { name: 'Elliot Yeo', result: 'LOSS', stat: '21 disposals', win: false },
            ].map((pick) => (
              <div key={pick.name} className="bg-[#0a0a0a] rounded-lg p-4">
                <div className="font-bold text-sm mb-1">{pick.name}</div>
                <div className={`font-black text-sm ${pick.win ? 'text-[#4ade80]' : 'text-red-400'}`}>{pick.result}</div>
                <div className="text-[#555] text-xs mt-1">{pick.stat}</div>
              </div>
            ))}
          </div>
          <Link href="/accuracy" className="text-[#f97316] font-bold text-sm hover:underline">
            Full track record →
          </Link>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-black mb-2">Built differently.</h2>
        <p className="text-[#888] mb-10">Financial analyst methodology applied to AFL player markets.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              n: '01',
              title: 'Financial methodology',
              desc: 'Edge identification, probability weighting, position sizing — the same framework used in equities research.',
            },
            {
              n: '02',
              title: 'Edge/Vol filtering',
              desc: 'Every pick scored by edge divided by volatility. Only statistically meaningful signals make the cut.',
            },
            {
              n: '03',
              title: 'Verified results',
              desc: 'Every pick logged before games start. Every result verified against official AFL data. No cherry picking.',
            },
            {
              n: '04',
              title: 'Transparent model',
              desc: 'The model is explained, not hidden. You know exactly why each pick was made.',
            },
          ].map(item => (
            <div key={item.n} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <div className="text-[#f97316] font-black text-sm mb-3">{item.n}</div>
              <div className="font-bold mb-2">{item.title}</div>
              <div className="text-[#888] text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#2a2a2a] rounded-2xl p-12">
          <div className="text-[#f97316] text-sm font-semibold uppercase tracking-wider mb-4">Pro Access</div>
          <h2 className="text-4xl font-black mb-4">Get the full model — $29/month</h2>
          <p className="text-[#888] text-lg mb-2">All HC picks. Track record. DvP rankings. Player explorer. Simulator.</p>
          <p className="text-[#555] text-sm mb-8">Cancel anytime. NBA included when it launches.</p>
          <Link
            href="/auth/payment"
            className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-xl px-14 py-5 rounded-xl"
          >
            Get Pro Now
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { label: 'HC Win Rate', value: '67.6%', color: 'text-[#4ade80]' },
              { label: 'Gross P&L', value: '+$18,760', color: 'text-[#4ade80]' },
              { label: 'HC Picks', value: '71', color: 'text-white' },
              { label: 'Rounds tracked', value: 'R3–R7', color: 'text-[#888]' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`font-black text-xl ${s.color}`}>{s.value}</div>
                <div className="text-[#555] text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
