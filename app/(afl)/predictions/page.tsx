'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { useProAccess } from '@/lib/auth'

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
  is_free_pick: boolean
}

const TIER_STYLE: Record<string, { border: string; badge: string; badgeText: string }> = {
  HC:   { border: 'rgba(249,115,22,0.25)', badge: '#f97316',        badgeText: '#000' },
  BET:  { border: 'rgba(96,165,250,0.2)',  badge: 'rgba(96,165,250,0.2)', badgeText: '#60a5fa' },
  LEAN: { border: 'rgba(80,80,80,0.3)',    badge: '#2a2a2a',        badgeText: '#666' },
}

function PickCard({ pick }: { pick: LivePick }) {
  const isOver = pick.prediction === 'OVER'
  const isWin = pick.result === 'WIN'
  const isLoss = pick.result === 'LOSS'
  const hasResult = pick.result !== null
  const ts = TIER_STYLE[pick.tier] ?? TIER_STYLE.LEAN

  return (
    <div style={{
      background: '#080808',
      border: `1px solid ${ts.border}`,
      borderLeft: `3px solid ${pick.tier === 'HC' ? '#f97316' : pick.tier === 'BET' ? '#60a5fa' : '#444'}`,
      borderRadius: 10,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <PlayerAvatar name={pick.player_name} team={pick.team} size={44} />

      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{pick.player_name}</span>
          <span style={{
            fontSize: 8, fontWeight: 800, color: ts.badgeText,
            background: ts.badge, borderRadius: 3, padding: '2px 6px', letterSpacing: '0.06em',
          }}>
            {pick.tier}
          </span>
          {pick.is_free_pick && (
            <span style={{ fontSize: 8, fontWeight: 800, color: '#4ade80', border: '1px solid #4ade80', borderRadius: 3, padding: '2px 5px' }}>
              FREE
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>{pick.position} · {pick.team}</div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Trade</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: isOver ? '#22c55e' : '#ef4444' }}>
            {pick.prediction} {isOver ? '⬆' : '⬇'} {pick.line}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>E/V</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#60a5fa' }}>{pick.edge_vol?.toFixed(2) ?? '-'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Result</div>
          {!hasResult ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>
              {pick.final_disposals !== null ? `${pick.final_disposals} disp` : 'Pending'}
            </div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 800, color: isWin ? '#4ade80' : '#f87171' }}>
              {isWin ? '✓ WIN' : '✗ LOSS'}
              {pick.final_disposals !== null && (
                <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>({pick.final_disposals})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ROUND = 8

export default function PredictionsPage() {
  const { isPro, isLoggedIn, loading: proLoading, recheckPro } = useProAccess()
  const [allPicks, setAllPicks] = useState<LivePick[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'HC' | 'ALL'>('HC')

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const roundRes = await fetch('/api/current-round')
        const roundData = await roundRes.json()
        const round = roundData.round || ROUND

        const res = await fetch(`/api/picks?round=${round}`)
        const data = await res.json()
        setAllPicks(data.picks || [])
      } catch {
        // silently fail
      }
      setLoading(false)
    }

    fetchPicks()
  }, [])

  const hcPicks = allPicks.filter(p => p.tier === 'HC')
  const betPicks = allPicks.filter(p => p.tier === 'BET')
  const otherPicks = allPicks.filter(p => p.tier !== 'HC' && p.tier !== 'BET')

  // What gets shown depends on Pro status + filter toggle
  const visiblePicks = (!proLoading && isPro)
    ? (filter === 'HC' ? hcPicks : allPicks)
    : hcPicks.filter(p => p.is_free_pick)

  const lockedHCCount = (!proLoading && !isPro) ? hcPicks.filter(p => !p.is_free_pick).length : 0

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Pro active banner */}
        {!proLoading && isPro && (
          <div style={{
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 10, padding: '10px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>Pro active — all picks unlocked</span>
          </div>
        )}

        {/* Refresh Pro status */}
        {isLoggedIn && !isPro && !proLoading && (
          <div style={{
            background: '#0d0d08', border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 10, padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 13, color: '#888' }}>Just subscribed? It may take a moment for access to activate.</span>
            <button
              onClick={recheckPro}
              style={{
                background: '#f97316', color: '#000', fontWeight: 700, fontSize: 12,
                border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer',
              }}
            >
              Refresh Pro Status
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Round {ROUND} · 2026
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            This week&apos;s picks
          </h1>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            HC = High Conviction (Edge/Vol ≥ 0.50). BET = model positive, lower conviction.
          </p>
        </div>

        {/* All Tiers toggle — Pro only */}
        {!proLoading && isPro && (
          <div style={{
            background: '#111', border: '1px solid #2a2a2a', borderRadius: 10,
            padding: '14px 16px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: 2 }}>View Mode</div>
              <div style={{ fontSize: 12, color: '#555' }}>
                {filter === 'HC'
                  ? 'Showing HIGH CONVICTION picks only — what we recommend'
                  : 'Showing all model picks — HC, BET, and lower tiers'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2, background: '#0a0a0a', borderRadius: 6, padding: 3 }}>
              {(['HC', 'ALL'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', border: 'none',
                    background: filter === f ? '#f97316' : 'transparent',
                    color: filter === f ? '#000' : '#666',
                    transition: 'all 0.15s',
                  }}
                >
                  {f === 'HC' ? 'HC Only' : 'All Tiers'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All-tiers research note */}
        {!proLoading && isPro && filter === 'ALL' && (
          <div style={{
            background: '#0a0800', border: '1px solid rgba(249,115,22,0.15)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 24,
            fontSize: 12, color: '#888', lineHeight: 1.7,
          }}>
            <strong style={{ color: '#f97316' }}>Research mode:</strong> LEAN and lower-tier picks are shown for analysis only — not recommended for betting.
            HC tier has produced a 67.6% win rate. BET and LEAN tiers have lower expected hit rates and should be treated as observational data.
          </div>
        )}

        {/* Picks list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: '#080808', border: '1px solid #111', borderRadius: 10, padding: '20px', height: 76 }} />
            ))}
          </div>
        ) : visiblePicks.length === 0 && hcPicks.length === 0 ? (
          <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#555', margin: 0 }}>No picks seeded yet for Round {ROUND}.</p>
          </div>
        ) : (
          <>
            {/* HC header */}
            {filter === 'ALL' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  HC Picks
                </span>
                <span style={{ fontSize: 11, color: '#555' }}>{hcPicks.length} signals</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {visiblePicks.filter(p => p.tier === 'HC').map(pick => <PickCard key={pick.id} pick={pick} />)}

              {lockedHCCount > 0 && (
                <div style={{
                  background: '#0a0a0a', border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 12, padding: '28px 32px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 14, color: '#888', margin: '0 0 6px' }}>
                    You&apos;re seeing 1 of {hcPicks.length} HC picks this round.
                  </p>
                  <p style={{ fontSize: 13, color: '#555', margin: '0 0 20px' }}>
                    Get Pro to unlock all {hcPicks.length} HC picks{betPicks.length > 0 ? ` plus ${betPicks.length} BET tier picks` : ''}.
                  </p>
                  <a
                    href="/auth/payment"
                    style={{
                      display: 'inline-block', background: '#f97316', color: '#000',
                      borderRadius: 8, padding: '11px 28px', fontSize: 14, fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Get Pro — $29/month
                  </a>
                </div>
              )}
            </div>

            {/* BET/lower tier picks */}
            {!proLoading && isPro && (
              <>
                {/* BET section */}
                {(filter === 'HC' ? betPicks : visiblePicks.filter(p => p.tier === 'BET')).length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        BET Picks
                      </span>
                      <span style={{ fontSize: 11, color: '#555' }}>{betPicks.length} signals — lower conviction</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(filter === 'HC' ? betPicks : visiblePicks.filter(p => p.tier === 'BET')).map(pick =>
                        <PickCard key={pick.id} pick={pick} />
                      )}
                    </div>
                  </div>
                )}

                {/* LEAN and other tiers — only in ALL mode */}
                {filter === 'ALL' && otherPicks.filter(p => p.tier !== 'BET').length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        LEAN / Other
                      </span>
                      <span style={{ fontSize: 11, color: '#444' }}>research only</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {otherPicks.filter(p => p.tier !== 'BET').map(pick =>
                        <PickCard key={pick.id} pick={pick} />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #111', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#444', lineHeight: 1.8 }}>
            Analytics only · Not financial advice · 18+ · Gamble responsibly
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
