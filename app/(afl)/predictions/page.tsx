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

function PickCard({ pick }: { pick: LivePick }) {
  const isOver = pick.prediction === 'OVER'
  const isWin = pick.result === 'WIN'
  const isLoss = pick.result === 'LOSS'
  const hasResult = pick.result !== null
  const tierColor = pick.tier === 'HC' ? '#f97316' : '#60a5fa'

  return (
    <div style={{
      background: '#080808',
      border: `1px solid ${pick.tier === 'HC' ? 'rgba(249,115,22,0.2)' : 'rgba(96,165,250,0.15)'}`,
      borderLeft: `3px solid ${tierColor}`,
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
            fontSize: 8, fontWeight: 800, color: '#000',
            background: tierColor, borderRadius: 3, padding: '2px 6px', letterSpacing: '0.06em',
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
        // silently fail — show empty state
      }
      setLoading(false)
    }

    fetchPicks()
  }, [])

  const hcPicks = allPicks.filter(p => p.tier === 'HC')
  const betPicks = allPicks.filter(p => p.tier === 'BET')

  // Free users see only is_free_pick=true picks
  const visibleHC = (!proLoading && isPro) ? hcPicks : hcPicks.filter(p => p.is_free_pick)
  const visibleBET = (!proLoading && isPro) ? betPicks : []
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

        {/* Refresh Pro status banner (just subscribed) */}
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
        <div style={{ marginBottom: 32 }}>
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

        {/* HC Picks */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#f97316', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HC Picks
            </h2>
            <span style={{ fontSize: 11, color: '#555' }}>{hcPicks.length} signals this round</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ background: '#080808', border: '1px solid #111', borderRadius: 10, padding: '20px', height: 76 }} />
              ))}
            </div>
          ) : visibleHC.length === 0 && hcPicks.length === 0 ? (
            <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#555', margin: 0 }}>No picks seeded yet for Round {ROUND}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleHC.map(pick => <PickCard key={pick.id} pick={pick} />)}

              {lockedHCCount > 0 && (
                <div style={{
                  background: '#0a0a0a', border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 12, padding: '28px 32px', textAlign: 'center', marginTop: 4,
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
          )}
        </div>

        {/* BET Picks (Pro only) */}
        {isPro && !proLoading && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#60a5fa', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                BET Picks
              </h2>
              <span style={{ fontSize: 11, color: '#555' }}>{betPicks.length} signals — lower conviction, worth tracking</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleBET.map(pick => <PickCard key={pick.id} pick={pick} />)}
            </div>
          </div>
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
