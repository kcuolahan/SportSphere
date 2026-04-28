'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { useProAccess } from '@/lib/auth'
import { useStats, BankrollPoint } from '@/lib/useStats'

// ── Bankroll line chart ────────────────────────────────────────────────────────
function BankrollChart({ data }: { data: BankrollPoint[] }) {
  const W = 700, H = 300
  const PL = 60, PR = 40
  const MAX_V = 95000
  const n = data.length

  const fx = (i: number) => PL + (i / (n - 1)) * (W - PL - PR)
  const fy = (v: number) => 260 - (v / MAX_V) * 230

  const actualPts = data.filter(d => !d.projected)
  const projPt = data.find(d => d.projected)
  const lastActualIdx = actualPts.length - 1

  const actualPath = actualPts.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${fx(i).toFixed(1)},${fy(d.value).toFixed(1)}`
  ).join(' ')

  const projPath = projPt
    ? `M${fx(lastActualIdx).toFixed(1)},${fy(actualPts[lastActualIdx].value).toFixed(1)} L${fx(n - 1).toFixed(1)},${fy(projPt.value).toFixed(1)}`
    : ''

  const yGridlines = [0, 20000, 40000, 60000, 80000]
  const formatV = (v: number) => {
    if (v < 1000) return `$${v}`
    const k = v / 1000
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>

      {/* Y gridlines */}
      {yGridlines.map(v => (
        <g key={v}>
          <line x1={PL} y1={fy(v)} x2={W - PR} y2={fy(v)} stroke="#1a1a1a" strokeWidth={0.5} />
          <text x={PL - 6} y={fy(v) + 4} textAnchor="end" fontSize={10} fill="#666">
            {v === 0 ? '$0' : `$${v / 1000}k`}
          </text>
        </g>
      ))}

      {/* Actual orange line */}
      <path d={actualPath} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Projected dashed line */}
      {projPath && <path d={projPath} fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="6,4" strokeOpacity={0.4} />}

      {/* Actual dots + value labels */}
      {actualPts.map((d, i) => {
        const isDown = i > 0 && d.value < actualPts[i - 1].value
        const cx = fx(i), cy = fy(d.value)
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={5} fill={isDown ? '#ef4444' : '#f97316'} stroke="#000" strokeWidth={1.5} />
            <text
              x={cx} y={isDown ? cy + 16 : cy - 10}
              textAnchor={i === 0 ? 'start' : 'middle'}
              fontSize={9} fontWeight="700"
              fill={isDown ? '#ef4444' : '#f97316'}
            >
              {formatV(d.value)}
            </text>
          </g>
        )
      })}

      {/* Projected dot (hollow) + label */}
      {projPt && (
        <>
          <circle cx={fx(n - 1)} cy={fy(projPt.value)} r={5} fill="none" stroke="#f97316" strokeWidth={1.5} strokeOpacity={0.5} />
          <text x={fx(n - 1)} y={fy(projPt.value) - 12} textAnchor="middle" fontSize={11} fontWeight="800" fill="#22c55e">
            ${Math.round(projPt.value / 1000)}k proj
          </text>
        </>
      )}

      {/* X axis labels */}
      {data.map((d, i) => (
        <text key={i} x={fx(i)} y={285} textAnchor="middle" fontSize={11} fill={d.projected ? '#555' : '#888'}>
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
          <div style={{ fontSize: 15, fontWeight: 800, color: '#60a5fa' }}>{pick.edge_vol?.toFixed(2) ?? '-'}</div>
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
  const { isPro, loading: proLoading, isLoggedIn, recheckPro } = useProAccess()
  const stats = useStats()
  const [allPicks, setAllPicks] = useState<LivePick[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const currentRound = stats.currentRound ?? stats.hc.latestRound
  const hcPicks = allPicks.filter(p => p.round === currentRound && p.tier === 'HC')

  useEffect(() => {
    const fetchPicks = async () => {
      const { data, error } = await supabase
        .from('live_picks')
        .select('*')
        .order('edge_vol', { ascending: false })
      if (!error && data) {
        setAllPicks(data)
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

  const roundsTracked = stats.hc.totalPicks > 0 ? stats.projections.roundsTracked : 5
  const firstRound = stats.byRound[0]?.round ?? 3
  const lastRoundNum = stats.byRound[stats.byRound.length - 1]?.round ?? 7
  const projectedBets = Math.round(
    stats.hc.totalPicks / Math.max(stats.projections.roundsTracked, 1) * stats.projections.totalRounds
  )
  const perBetAvg = Math.round(stats.hc.grossPL / Math.max(stats.hc.totalPicks, 1))

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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .skeleton { background:#111; border-radius:6px; animation:pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ position: 'fixed', top: 60, left: 0, right: 0, height: 120, zIndex: 0, background: 'linear-gradient(180deg, #1a0a00 0%, #000000 100%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '84px 20px 60px', position: 'relative' }}>

        {/* ── PRO REFRESH BANNER ── */}
        {isLoggedIn && !isPro && !proLoading && (
          <div style={{
            background: '#0d0d08', border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 10, padding: '14px 18px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 13, color: '#888' }}>
              Just subscribed? It may take a moment for access to activate.
            </span>
            <button
              onClick={() => recheckPro()}
              style={{
                background: '#f97316', color: '#000', fontWeight: 700,
                fontSize: 12, border: 'none', borderRadius: 6,
                padding: '7px 16px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Refresh Pro Status
            </button>
          </div>
        )}

        {/* ── PRO STATUS BANNER ── */}
        {isPro && (
          <div style={{
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 10, padding: '10px 18px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
              Pro access active — all picks unlocked
            </span>
          </div>
        )}

        {/* ── HC DISCLOSURE ── */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 36 }}>
          <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.7 }}>
            <span style={{ color: '#f97316', fontWeight: 700 }}>HC picks only.</span>{' '}
            We publish HIGH CONVICTION filtered picks - STRONG model confidence with Edge/Vol ≥ 0.50.
            The full model generates ~150 predictions per round; these are the subset we stand behind.
            All results verified against official AFL game data.
          </p>
        </div>

        {/* ── SECTION 1: HERO ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Verified Track Record
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.1 }}>
            What $1,000 per bet actually returned - Rounds 3 to 7
          </h1>
          <p style={{ fontSize: 18, color: '#888', margin: '0 0 36px', lineHeight: 1.5 }}>
            After {roundsTracked} rounds using $1,000 per bet, here is where you stand - after accounting for the $29/month SportSphere subscription.
          </p>

          <div className="hero-grid" style={{ marginBottom: 20 }}>
            {stats.loading ? (
              [0,1,2,3].map(i => (
                <div key={i} style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                  <div className="skeleton" style={{ height: 40, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%', margin: '0 auto' }} />
                </div>
              ))
            ) : [
              { label: 'Total Units Staked', value: `$${(stats.hc.totalPicks * 1000).toLocaleString()}`, color: '#f0f0f0' },
              { label: 'Win Rate', value: `${stats.hc.winRatePct}%`, sub: `${stats.hc.wins}W · ${stats.hc.losses}L`, color: '#f97316' },
              { label: 'Gross P&L', value: `+$${stats.hc.grossPL.toLocaleString()}`, color: '#22c55e' },
              { label: 'ROI', value: `${stats.hc.roiPct}%`, color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{s.sub}</div>}
                <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#080808', border: '1px solid #1a1a1a', borderRadius: 8, padding: '14px 18px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
            All results use $1,000 flat stake at 1.87 average decimal odds. Verified against official AFL game data each round.
          </div>
        </section>

        {/* ── SECTION 2: ANNUALIZED PROJECTION ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            The Maths
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
            If the model runs like this across {stats.projections.totalRounds} rounds
          </h2>

          <div className="proj-grid" style={{ marginBottom: 20 }}>
            <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                At the same pace
              </div>
              {[
                { label: 'Projected total bets', value: `~${projectedBets}` },
                { label: 'Projected gross P&L', value: `+$${stats.projections.projectedGrossPL.toLocaleString()}`, color: '#22c55e' },
                { label: 'Projected ROI', value: `${stats.hc.roiPct}%`, color: '#22c55e' },
                { label: 'Per-bet average', value: `$${perBetAvg}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0d0d0d' }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color ?? '#f0f0f0' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#030f08', border: '1px solid #14532d', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                After paying for SportSphere all season (${stats.projections.monthlyFee} x {stats.projections.seasonMonths} months = ${stats.projections.seasonFee})
              </div>
              {[
                { label: 'Less subscription cost', value: `-$${stats.projections.seasonFee}`, color: '#f87171' },
                { label: 'Net annual P&L', value: `+$${stats.projections.netAfterFee.toLocaleString()}`, color: '#4ade80' },
                { label: 'Subscription multiple', value: `${stats.projections.subscriptionMultiple}x`, color: '#4ade80' },
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
            <div style={{ fontSize: 'clamp(44px, 8vw, 72px)', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12 }}>
              {stats.projections.subscriptionMultiple}x
            </div>
            <p style={{ fontSize: 16, color: '#4ade80', margin: '0 0 8px', fontWeight: 600 }}>
              Every dollar you spend on SportSphere returns {stats.projections.subscriptionMultiple}x in gross profit.
            </p>
            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Based on verified results from Rounds 3 to 7, 2026 season.</p>
          </div>
        </section>

        {/* ── SECTION 3: BANKROLL LINE CHART ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Round by Round
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            Starting with $1,000: what the model returned each round
          </h2>

          <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 400 }}>
                <BankrollChart data={stats.bankroll} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 2.5, background: '#f97316', borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: '#666' }}>Actual (R{firstRound} to R{lastRoundNum})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 0, borderTop: '2px dashed rgba(249,115,22,0.45)', borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: '#555' }}>Projected (R{lastRoundNum + 1} to R{stats.projections.totalRounds})</span>
              </div>
            </div>
            <p style={{ fontSize: 10, color: '#444', margin: '10px 0 0', lineHeight: 1.6 }}>
              R4 shows a losing round included for full transparency. R{stats.projections.totalRounds} projected at current pace.
            </p>
          </div>
        </section>

        {/* ── SECTION 4: HC PICKS ── */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Round {currentRound}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              This round's picks - HC tier only
            </h2>
            <span style={{ fontSize: 11, color: '#555' }}>Results update automatically as games finish</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ background: '#080808', border: '1px solid #111', borderRadius: 10, padding: '20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 11, width: '25%' }} />
                  </div>
                  <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 6 }} />
                </div>
              ))}
            </div>
          ) : hcPicks.length === 0 ? (
            <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 8px' }}>No HC signals loaded yet for Round {currentRound}.</p>
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
                      Unlock All Signals - $29/month
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
