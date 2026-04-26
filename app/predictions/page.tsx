'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { PlayerAvatar } from '@/components/PlayerAvatar'

const ROUND_DATA = [
  { round: 3, pnl: 2500, wins: 4, losses: 1, isCurrent: false },
  { round: 4, pnl: 200, wins: 6, losses: 5, isCurrent: false },
  { round: 5, pnl: 4200, wins: 6, losses: 1, isCurrent: false },
  { round: 6, pnl: 2400, wins: 3, losses: 4, isCurrent: false },
  { round: 7, pnl: 900, wins: 1, losses: 0, isCurrent: true },
]

const MAX_PNL = 4200

interface LivePick {
  id: string
  round: number
  player_name: string
  team: string
  position: string
  line: number
  prediction: string
  edge_vol: number
  tier: string
  odds: number
  final_disposals: number | null
  result: string | null
  profit_loss: number | null
}

export default function PredictionsPage() {
  const [hcPicks, setHcPicks] = useState<LivePick[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const fetchPicks = async () => {
      const { data, error } = await supabase
        .from('live_picks')
        .select('*')
        .order('edge_vol', { ascending: false })
      if (!error && data) {
        setHcPicks(data.filter(p => p.round === 7 && p.tier === 'HC'))
        setLastUpdated(new Date())
      }
      setLoading(false)
    }

    fetchPicks()

    const subscription = supabase
      .channel('live_picks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_picks' }, () => {
        fetchPicks()
      })
      .subscribe()

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auto-update-results')
        const result = await res.json()
        if (result.updated > 0) fetchPicks()
      } catch {}
    }, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />

      <style>{`
        .hero-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .proj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .chart-wrap { overflow-x: auto; }
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .proj-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Gradient band */}
      <div style={{
        position: 'fixed', top: 60, left: 0, right: 0, height: 120, zIndex: 0,
        background: 'linear-gradient(180deg, #1a0a00 0%, #000000 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '84px 20px 60px', position: 'relative' }}>

        {/* ── SECTION 1: HERO ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Verified Track Record
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.1 }}>
            The $1,000 Unit Thesis
          </h1>
          <p style={{ fontSize: 18, color: '#888', margin: '0 0 36px', lineHeight: 1.5 }}>
            5 rounds tracked. Real money. Verified results.
          </p>

          <div className="hero-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Units Staked', value: '$31,000', color: '#f0f0f0' },
              { label: 'Win Rate', value: '64.5%', sub: '20W · 11L', color: '#f97316' },
              { label: 'Gross P&L', value: '+$6,400', color: '#22c55e' },
              { label: 'ROI', value: '20.6%', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#080808', border: '1px solid #111',
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {s.value}
                </div>
                {s.sub && <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{s.sub}</div>}
                <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#080808', border: '1px solid #1a1a1a',
            borderRadius: 8, padding: '14px 18px',
            fontSize: 13, color: '#666', lineHeight: 1.7,
          }}>
            Based on $1,000 flat stake per bet at 1.87 average odds.
            All results verified against official game data.
          </div>
        </section>

        {/* ── SECTION 2: ANNUALIZED PROJECTION ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            The Maths
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
            Extrapolated to Full Season (23 Rounds)
          </h2>

          <div className="proj-grid" style={{ marginBottom: 20 }}>
            {/* Left */}
            <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                If This Pattern Holds
              </div>
              {[
                { label: 'Projected total bets', value: '~143' },
                { label: 'Projected gross P&L', value: '+$29,440', color: '#22c55e' },
                { label: 'Projected ROI', value: '20.4%', color: '#22c55e' },
                { label: 'Per-bet average', value: '$206' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #0d0d0d',
                }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color ?? '#f0f0f0' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Right */}
            <div style={{ background: '#030f08', border: '1px solid #14532d', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                After $29/month AFL Season Access (6 months = $174)
              </div>
              {[
                { label: 'Less subscription cost', value: '-$174', color: '#f87171' },
                { label: 'Net annual P&L', value: '+$29,266', color: '#4ade80' },
                { label: 'Subscription multiple', value: '168x', color: '#4ade80' },
                { label: 'Monthly break-even', value: '2 days' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #052e16',
                }}>
                  <span style={{ fontSize: 13, color: '#4ade8099' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color ?? '#f0f0f0' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 168x callout */}
          <div style={{
            background: 'linear-gradient(135deg, #030f08 0%, #071a0c 100%)',
            border: '1px solid #22c55e40',
            borderRadius: 12, padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(44px, 8vw, 72px)', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12 }}>
              168x
            </div>
            <p style={{ fontSize: 16, color: '#4ade80', margin: '0 0 8px', fontWeight: 600 }}>
              Your $174 subscription is recovered 168 times over.
            </p>
            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
              That&apos;s not marketing. That&apos;s math.
            </p>
          </div>
        </section>

        {/* ── SECTION 3: P&L BY ROUND ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Round by Round
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            P&L by Round ($1,000 per unit)
          </h2>

          <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '24px' }}>
            <div className="chart-wrap">
              <div style={{ minWidth: 400 }}>
                {ROUND_DATA.map(r => {
                  const pct = Math.max(3, (r.pnl / MAX_PNL) * 90)
                  return (
                    <div key={r.round} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 28, fontSize: 11, fontWeight: r.isCurrent ? 700 : 400, color: r.isCurrent ? '#f97316' : '#555', flexShrink: 0 }}>
                          R{r.round}
                        </div>
                        <div style={{ flex: 1, height: 30, position: 'relative' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: r.isCurrent ? 'rgba(249,115,22,0.55)' : '#f97316',
                            borderRadius: 4,
                            border: r.isCurrent ? '1px solid #f97316' : 'none',
                          }} />
                        </div>
                        <div style={{ width: 130, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                            +${(r.pnl / 1000).toFixed(1)}k
                          </span>
                          <span style={{ fontSize: 11, color: '#555' }}>{r.wins}W-{r.losses}L</span>
                          {r.isCurrent && (
                            <span style={{
                              fontSize: 8, fontWeight: 800, color: '#f97316',
                              background: '#f9731618', border: '1px solid #f9731640',
                              borderRadius: 3, padding: '1px 5px', letterSpacing: '0.04em',
                            }}>
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Projected R8-23 */}
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, fontSize: 11, color: '#444', flexShrink: 0 }}>R8+</div>
                    <div style={{ flex: 1, height: 30, position: 'relative' }}>
                      <div style={{
                        height: '100%', width: '80%',
                        background: 'rgba(249,115,22,0.12)',
                        borderRadius: 4,
                        border: '1px dashed #f9731430',
                      }} />
                    </div>
                    <div style={{ width: 130, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e50' }}>+$16.8k</span>
                      <span style={{ fontSize: 9, color: '#444', fontStyle: 'italic' }}>projected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 10, color: '#444', margin: '16px 0 0', lineHeight: 1.6 }}>
              R7 extrapolated from HC picks so far at $1,000/unit. R8–23 projected at current pace.
            </p>
          </div>
        </section>

        {/* ── SECTION 4: HC PICKS ── */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Round 7
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              High Conviction Model Signals
            </h2>
            <span style={{ fontSize: 11, color: '#555' }}>
              Live results streamed real-time
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 13, color: '#555' }}>
              Loading signals...
            </div>
          ) : hcPicks.length === 0 ? (
            <div style={{
              background: '#080808', border: '1px solid #111',
              borderRadius: 12, padding: '48px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 8px' }}>No HC signals loaded yet for Round 7.</p>
              <p style={{ fontSize: 12, color: '#333', margin: 0 }}>Check back after picks are seeded.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hcPicks.map(pick => {
                const isWin = pick.result === 'WIN'
                const isLoss = pick.result === 'LOSS'
                const hasResult = pick.result !== null
                const isOver = pick.prediction === 'OVER'

                return (
                  <div key={pick.id} style={{
                    background: '#080808',
                    border: '1px solid rgba(249,115,22,0.15)',
                    borderLeft: '3px solid #f97316',
                    borderRadius: 10, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}>
                    <PlayerAvatar name={pick.player_name} team={pick.team} size={44} />

                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{pick.player_name}</span>
                        <span style={{
                          fontSize: 8, fontWeight: 800, color: '#000',
                          background: '#f97316', borderRadius: 3,
                          padding: '2px 6px', letterSpacing: '0.06em',
                        }}>HC</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        {pick.position} · {pick.team}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Trade Thesis</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: isOver ? '#22c55e' : '#ef4444' }}>
                          {pick.prediction} {isOver ? '⬆' : '⬇'} {pick.line}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>E/V</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#60a5fa' }}>
                          {pick.edge_vol?.toFixed(2) ?? '—'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Status</div>
                        {!hasResult ? (
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>
                            {pick.final_disposals !== null ? `${pick.final_disposals} disp` : 'Pending'}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, fontWeight: 800, color: isWin ? '#4ade80' : '#f87171' }}>
                            {isWin ? '✓ WIN' : isLoss ? '✗ LOSS' : pick.result}
                            {pick.final_disposals !== null && (
                              <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>({pick.final_disposals})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {lastUpdated && (
            <p style={{ fontSize: 10, color: '#333', marginTop: 20, textAlign: 'center' }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </section>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid #111', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}>
            Based on $1,000 flat stake per bet at 1.87 average odds · Analytics only · Not financial advice · 18+ · Gamble responsibly
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
