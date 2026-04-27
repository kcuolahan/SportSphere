'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { useProAccess } from '@/lib/auth'

// ── Bankroll line chart ────────────────────────────────────────────────────────
const BANKROLL = [
  { label: 'Start',    value:  1000, projected: false },
  { label: 'R3',       value:  9440, projected: false },
  { label: 'R4',       value:  7270, projected: false },
  { label: 'R5',       value: 10230, projected: false },
  { label: 'R6',       value: 13060, projected: false },
  { label: 'R7',       value: 19760, projected: false },
  { label: 'R24 proj', value: 84000, projected: true  },
]

function BankrollChart() {
  const W = 700, H = 280
  const PL = 46, PR = 12, PT = 28, PB = 44
  const cw = W - PL - PR   // 642
  const ch = H - PT - PB   // 208
  const n = BANKROLL.length

  // Two-zone Y scale: bottom 65% = $0–$20k (actual), top 35% = $20k–$80k (projected)
  const SPLIT_V = 20000
  const Z1 = 0.65, Z2 = 0.35
  const splitY = PT + ch * Z2

  const fy = (v: number): number => {
    if (v <= SPLIT_V) return splitY + (1 - v / SPLIT_V) * ch * Z1
    return PT + (1 - (v - SPLIT_V) / (90000 - SPLIT_V)) * ch * Z2
  }
  const fx = (i: number) => PL + (i / (n - 1)) * cw

  const actualPts = BANKROLL.slice(0, 6)
  const actualPath = actualPts.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${fx(i).toFixed(1)},${fy(d.value).toFixed(1)}`
  ).join(' ')
  const projPath = `M${fx(5).toFixed(1)},${fy(BANKROLL[5].value).toFixed(1)} L${fx(6).toFixed(1)},${fy(BANKROLL[6].value).toFixed(1)}`

  const fmtVal = (v: number) => {
    if (v >= 10000) return `$${(v / 1000).toFixed(0)}k`
    if (v >= 1000)  return `$${(v / 1000).toFixed(1)}k`
    return `$${v}`
  }

  const yTicks = [0, 5000, 10000, 15000, 20000] as const

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>

      {/* Y gridlines — actual zone ($0–$20k) */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PL} y1={fy(v)} x2={W - PR} y2={fy(v)} stroke="#141414" strokeWidth={v === 0 ? 1 : 0.5} strokeDasharray={v === 0 ? '0' : '3,5'} />
          <text x={PL - 6} y={fy(v) + 4} textAnchor="end" fontSize={9} fill="#444">
            {v === 0 ? '$0' : `$${v / 1000}k`}
          </text>
        </g>
      ))}

      {/* Axis break indicator between $20k and $75k zones */}
      <text x={PL - 6} y={splitY - 6} textAnchor="end" fontSize={10} fill="#333">~</text>

      {/* Y gridline — projected reference at $84k */}
      <line x1={PL} y1={fy(84000)} x2={W - PR} y2={fy(84000)} stroke="#22c55e" strokeWidth={0.5} strokeDasharray="3,5" strokeOpacity={0.3} />
      <text x={PL - 6} y={fy(84000) + 4} textAnchor="end" fontSize={9} fill="#22c55e" fillOpacity={0.7}>$84k+</text>

      {/* Actual orange line */}
      <path d={actualPath} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Projected dashed line */}
      <path d={projPath} fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="6,5" strokeOpacity={0.45} />

      {/* Actual dots */}
      {actualPts.map((d, i) => (
        <circle key={i} cx={fx(i)} cy={fy(d.value)} r={5} fill="#f97316" stroke="#000" strokeWidth={1.5} />
      ))}

      {/* Projected dot (hollow) */}
      <circle cx={fx(6)} cy={fy(BANKROLL[6].value)} r={5} fill="none" stroke="#f97316" strokeWidth={1.5} strokeOpacity={0.45} />

      {/* Value annotations — actual points */}
      {actualPts.map((d, i) => {
        const isDip = i === 2  // R4 is the down round
        const anchor: 'start' | 'middle' = i === 0 ? 'start' : 'middle'
        return (
          <text
            key={i}
            x={fx(i)}
            y={isDip ? fy(d.value) + 18 : fy(d.value) - 10}
            textAnchor={anchor}
            fontSize={9}
            fontWeight="700"
            fill={isDip ? '#ef4444' : '#f97316'}
          >
            {fmtVal(d.value)}
          </text>
        )
      })}

      {/* Projected annotation */}
      <text x={fx(6)} y={fy(84000) - 12} textAnchor="middle" fontSize={12} fontWeight="800" fill="#22c55e">$84,000+</text>
      <text x={fx(6)} y={fy(84000) + 2}  textAnchor="middle" fontSize={8}  fill="#555">projected</text>

      {/* X axis labels */}
      {BANKROLL.map((d, i) => (
        <text key={i} x={fx(i)} y={H - 8} textAnchor="middle" fontSize={9} fill={d.projected ? '#555' : '#666'}>
          {d.label}
        </text>
      ))}
    </svg>
  )
}

// ── Pick card ──────────────────────────────────────────────────────────────────
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

function PickCard({ pick }: { pick: LivePick }) {
  const isOver = pick.prediction === 'OVER'
  const isWin = pick.result === 'WIN'
  const isLoss = pick.result === 'LOSS'
  const hasResult = pick.result !== null

  return (
    <div style={{
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
          <span style={{ fontSize: 8, fontWeight: 800, color: '#000', background: '#f97316', borderRadius: 3, padding: '2px 6px', letterSpacing: '0.06em' }}>HC</span>
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>{pick.position} · {pick.team}</div>
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
          <div style={{ fontSize: 15, fontWeight: 800, color: '#60a5fa' }}>{pick.edge_vol?.toFixed(2) ?? '—'}</div>
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
              {pick.final_disposals !== null && <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>({pick.final_disposals})</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const { isPro, loading: proLoading } = useProAccess()
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
        setHcPicks(data.filter((p: LivePick) => p.round === 7 && p.tier === 'HC'))
        setLastUpdated(new Date())
      }
      setLoading(false)
    }

    fetchPicks()

    const subscription = supabase
      .channel('live_picks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_picks' }, () => fetchPicks())
      .subscribe()

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auto-update-results')
        const result = await res.json()
        if (result.updated > 0) fetchPicks()
      } catch {}
    }, 30000)

    return () => { subscription.unsubscribe(); clearInterval(interval) }
  }, [])

  const visiblePicks = (!proLoading && !isPro) ? hcPicks.slice(0, 1) : hcPicks
  const lockedCount = (!proLoading && !isPro) ? Math.max(0, hcPicks.length - 1) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />

      <style>{`
        .hero-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .proj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .proj-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ position: 'fixed', top: 60, left: 0, right: 0, height: 120, zIndex: 0, background: 'linear-gradient(180deg, #1a0a00 0%, #000000 100%)', pointerEvents: 'none' }} />

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
              { label: 'Total Units Staked', value: '$71,000', color: '#f0f0f0' },
              { label: 'Win Rate', value: '67.6%', sub: '48W · 23L', color: '#f97316' },
              { label: 'Gross P&L', value: '+$18,760', color: '#22c55e' },
              { label: 'ROI', value: '26.4%', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{s.sub}</div>}
                <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#080808', border: '1px solid #1a1a1a', borderRadius: 8, padding: '14px 18px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
            Based on $1,000 flat stake per bet at 1.87 average odds. All results verified against official game data.
          </div>
        </section>

        {/* ── SECTION 2: ANNUALIZED PROJECTION ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            The Maths
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
            Extrapolated to Full Season (24 Rounds)
          </h2>

          <div className="proj-grid" style={{ marginBottom: 20 }}>
            <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                If This Pattern Holds
              </div>
              {[
                { label: 'Projected total bets', value: '~341' },
                { label: 'Projected gross P&L', value: '+$90,048', color: '#22c55e' },
                { label: 'Projected ROI', value: '26.4%', color: '#22c55e' },
                { label: 'Per-bet average', value: '$264' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0d0d0d' }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color ?? '#f0f0f0' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#030f08', border: '1px solid #14532d', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                After $29/month AFL Season Access (6 months = $174)
              </div>
              {[
                { label: 'Less subscription cost', value: '-$174', color: '#f87171' },
                { label: 'Net annual P&L', value: '+$89,874', color: '#4ade80' },
                { label: 'Subscription multiple', value: '516x', color: '#4ade80' },
                { label: 'Monthly break-even', value: '< 1 day' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #052e16' }}>
                  <span style={{ fontSize: 13, color: '#4ade8099' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color ?? '#f0f0f0' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #030f08 0%, #071a0c 100%)', border: '1px solid #22c55e40', borderRadius: 12, padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(44px, 8vw, 72px)', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12 }}>516x</div>
            <p style={{ fontSize: 16, color: '#4ade80', margin: '0 0 8px', fontWeight: 600 }}>Your $174 subscription is recovered 516 times over.</p>
            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>That&apos;s not marketing. That&apos;s math.</p>
          </div>
        </section>

        {/* ── SECTION 3: BANKROLL LINE CHART ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Round by Round
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            Bankroll Growth Starting from $1,000
          </h2>

          <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 400 }}>
                <BankrollChart />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 2.5, background: '#f97316', borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: '#666' }}>Actual (R3–R7)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 0, borderTop: '2px dashed rgba(249,115,22,0.45)', borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: '#555' }}>Projected (R8–R24)</span>
              </div>
            </div>
            <p style={{ fontSize: 10, color: '#444', margin: '10px 0 0', lineHeight: 1.6 }}>
              R4 shows a losing round included for full transparency. R24 projected at current pace.
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
            <span style={{ fontSize: 11, color: '#555' }}>Live results streamed real-time</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 13, color: '#555' }}>Loading signals...</div>
          ) : hcPicks.length === 0 ? (
            <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 8px' }}>No HC signals loaded yet for Round 7.</p>
              <p style={{ fontSize: 12, color: '#333', margin: 0 }}>Check back after picks are seeded.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visiblePicks.map(pick => <PickCard key={pick.id} pick={pick} />)}

              {lockedCount > 0 && (
                <div style={{
                  background: '#0a0a0a', border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 12, padding: '28px 32px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Pro Only
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                    You&apos;re viewing 1 of {hcPicks.length} HC Model Signals
                  </h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>
                    {lockedCount} more signal{lockedCount !== 1 ? 's' : ''} locked. Upgrade to Pro to see all picks, real-time results, and full analytics.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/auth/payment" style={{ display: 'inline-block', background: '#f97316', color: '#000', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                      Unlock All Signals — $29/month
                    </a>
                  </div>
                </div>
              )}
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
