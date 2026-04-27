'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const XP_RULES = {
  AFL: [
    { threshold: '20+ disposals', xp: 5 },
    { threshold: '25+ disposals', xp: 10 },
    { threshold: '30+ disposals', xp: 20 },
    { threshold: '35+ disposals', xp: 35 },
    { threshold: '40+ disposals', xp: 55 },
    { threshold: 'Beat the line', xp: 10, bonus: true },
    { threshold: 'Captain pick', xp: 'x2', bonus: true },
  ],
  NBA: [
    { threshold: '20+ points', xp: 8 },
    { threshold: '30+ points', xp: 18 },
    { threshold: '40+ points', xp: 35 },
    { threshold: '10+ assists', xp: 15 },
    { threshold: '12+ rebounds', xp: 15 },
    { threshold: 'Triple double', xp: 25, bonus: true },
  ],
  NFL: [
    { threshold: '100+ receiving yards', xp: 15 },
    { threshold: '100+ rushing yards', xp: 15 },
    { threshold: '300+ passing yards', xp: 20 },
    { threshold: 'Touchdown', xp: 20, bonus: true },
    { threshold: '150+ yards', xp: 30 },
  ],
}

export default function FantasyPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistDone, setWaitlistDone] = useState(false)

  function handleWaitlist() {
    if (!waitlistEmail.includes('@')) return
    setWaitlistDone(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      {/* Coming soon banner — below fixed nav */}
      <div style={{ marginTop: 60 }} className="bg-[#f97316] text-black py-3 text-center font-black text-sm uppercase tracking-widest">
        Coming 2027 Season &mdash; Join the waitlist below
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2 mb-8">
          <span className="text-[#f97316] text-sm font-bold uppercase tracking-wider">Coming 2027 Season</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          Fantasy sports.<br />
          <span className="text-[#f97316]">With an actual edge.</span>
        </h1>
        <p className="text-xl text-[#888] max-w-2xl mx-auto mb-10">
          Draft AFL, NBA and NFL players in one season-long competition.
          Use the SportSphere model to outpick your mates.
          One champion. Three sports. All year.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/payment"
            className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-lg px-10 py-4 rounded"
          >
            Get Pro - Fantasy included when it launches
          </Link>
          <a
            href="#how-it-works"
            className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f97316]/30 font-bold text-lg px-10 py-4 rounded text-white"
          >
            How it works
          </a>
        </div>
      </div>

      {/* The gap */}
      <div className="bg-[#111] border-y border-[#1a1a1a] py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[#666] font-bold text-sm uppercase tracking-wider mb-4">Every platform today</h3>
              <div className="space-y-3">
                {[
                  'Single sport only',
                  'No analytical edge',
                  'SuperCoach and DreamTeam have barely changed in years',
                  'ESPN does NBA and NFL in separate silos',
                  'Season ends and your data disappears',
                  'No cross-sport season champion',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#555]">
                    <span className="text-red-500 font-bold">x</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[#f97316] font-bold text-sm uppercase tracking-wider mb-4">SportSphere Fantasy</h3>
              <div className="space-y-3">
                {[
                  'AFL, NBA and NFL in one draft',
                  'Model-backed pick suggestions during draft',
                  'Clean, fast interface built from scratch',
                  'XP carries across all three sports all year',
                  'One season-long champion crowned in February',
                  'Waiver wire and trade intelligence from the model',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white">
                    <span className="text-[#4ade80] font-bold">+</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-black text-center mb-4">How it works</h2>
        <p className="text-center text-[#555] text-sm mb-12 uppercase tracking-widest font-bold">Coming 2027 AFL Season</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Create your league',
              desc: 'Invite up to 12 mates. Choose which sports to include. Set your draft date. Everyone gets the same tools.',
            },
            {
              step: '02',
              title: 'Draft with the model',
              desc: "During your draft, see each player's SportSphere projection for the upcoming round. Know who to pick before anyone else does.",
            },
            {
              step: '03',
              title: 'Earn XP all season',
              desc: 'Players earn XP for performance milestones. Your captain earns double. XP accumulates across all three sports until February.',
            },
          ].map((item, i) => (
            <div key={i} className="text-center bg-[#111] border border-[#1a1a1a] rounded-xl p-8 relative">
              <div className="absolute top-3 right-3 bg-[#f97316]/10 border border-[#f97316]/20 rounded text-[#f97316] text-[10px] font-black px-2 py-1 uppercase tracking-wider">
                2027
              </div>
              <div className="text-[#f97316] font-black text-sm tracking-widest mb-4">{item.step}</div>
              <h3 className="text-xl font-black mb-3">{item.title}</h3>
              <p className="text-[#888]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* XP Scoring */}
      <div className="bg-[#111] border-y border-[#1a1a1a] py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12">XP Scoring System</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(Object.entries(XP_RULES) as [string, typeof XP_RULES.AFL][]).map(([sport, rules]) => (
              <div key={sport} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
                <div className="text-[#f97316] font-black text-sm uppercase tracking-wider mb-4">
                  {sport}
                </div>
                <div className="space-y-3">
                  {rules.map((rule, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className={`text-sm ${rule.bonus ? 'text-[#f97316]' : 'text-[#888]'}`}>
                        {rule.threshold}
                      </span>
                      <span className={`font-black text-sm ${rule.bonus ? 'text-[#f97316]' : 'text-[#4ade80]'}`}>
                        {typeof rule.xp === 'number' ? `+${rule.xp} XP` : rule.xp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The edge */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-[#1a1a1a] border border-[#f97316]/20 rounded-2xl p-12">
          <h2 className="text-3xl font-black mb-4">
            The SportSphere edge
          </h2>
          <p className="text-[#888] text-lg mb-10 max-w-2xl">
            Every other fantasy platform gives your whole league the same information.
            SportSphere gives you the model. Your mates are guessing. You are not.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Draft mode',
                desc: "See each player's projected disposals, points or yards before you pick. The model runs in the background.",
              },
              {
                title: 'Captain intelligence',
                desc: 'Each week, pick your captain for double XP. The model shows E/V ratios so you pick the right one.',
              },
              {
                title: 'Trade analyser',
                desc: "Before accepting a trade, see both players' DvP matchups for the next four rounds.",
              },
              {
                title: 'Waiver alerts',
                desc: 'The model flags waiver wire players with strong upcoming matchups before anyone else sees it.',
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="font-black text-lg mb-2">{item.title}</div>
                <p className="text-[#888]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist form */}
      <div className="max-w-md mx-auto px-4 mb-16">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 text-center">
          <h3 className="font-black text-xl mb-2">Get early access</h3>
          <p className="text-[#888] text-sm mb-6">
            We will email you when SportSphere Fantasy launches.
            Pro subscribers get access first.
          </p>
          {waitlistDone ? (
            <div className="bg-[#030f08] border border-[#14532d] rounded-lg p-4 text-[#4ade80] font-bold text-sm">
              You are on the list. We will be in touch.
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
                className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#f97316]/50"
              />
              <button
                onClick={handleWaitlist}
                className="bg-[#f97316] hover:bg-[#ea580c] text-black font-black px-6 py-3 rounded"
              >
                Notify Me
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-4xl font-black mb-4">Get in early</h2>
        <p className="text-[#888] text-lg mb-8">
          Pro subscribers get SportSphere Fantasy included at no extra cost.
          AFL fantasy launches Round 1, 2027. NBA and NFL follow in season.
        </p>
        <Link
          href="/auth/payment"
          className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-xl px-16 py-5 rounded"
        >
          Get Pro - $29/month
        </Link>
        <p className="text-[#555] text-sm mt-4">
          Includes AFL picks, simulator, DvP, track record and Fantasy when it launches.
        </p>
      </div>

      <Footer />
    </div>
  )
}
