'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface Pick {
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

interface RoundGroup {
  round: number
  picks: Pick[]
  wins: number
  losses: number
  pending: number
  netPL: number
  winRate: number
}

export default function ProofPage() {
  const [rounds, setRounds] = useState<RoundGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRound, setExpandedRound] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/picks?round=ALL&tier=HC')
      .then(r => r.json())
      .then(data => {
        const picks: Pick[] = data.picks || []
        const grouped: Record<number, Pick[]> = {}
        for (const p of picks) {
          if (!grouped[p.round]) grouped[p.round] = []
          grouped[p.round].push(p)
        }
        const roundGroups: RoundGroup[] = Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([round, rPicks]) => {
            const wins = rPicks.filter(p => p.result === 'WIN').length
            const losses = rPicks.filter(p => p.result === 'LOSS').length
            const pending = rPicks.filter(p => !p.result).length
            const netPL = rPicks.reduce((sum, p) => sum + (p.profit_loss ?? 0), 0)
            const winRate = wins + losses > 0 ? Math.round(wins / (wins + losses) * 1000) / 10 : 0
            return { round: Number(round), picks: rPicks, wins, losses, pending, netPL, winRate }
          })
        setRounds(roundGroups)
        if (roundGroups.length > 0) setExpandedRound(roundGroups[0].round)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalPicks = rounds.reduce((t, r) => t + r.picks.length, 0)
  const totalWins = rounds.reduce((t, r) => t + r.wins, 0)
  const totalLosses = rounds.reduce((t, r) => t + r.losses, 0)
  const totalPL = rounds.reduce((t, r) => t + r.netPL, 0)
  const overallWR = totalWins + totalLosses > 0
    ? Math.round(totalWins / (totalWins + totalLosses) * 1000) / 10
    : 0

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Verified Record
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            The proof — every HC pick we&apos;ve published in 2026
          </h1>
          <div style={{ background: '#080808', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 18px', maxWidth: 680 }}>
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.7 }}>
              Every HC pick is logged before bookmaker games begin. We do not edit, delete, or retroactively alter results.
              Losses are part of the record. Data verified against official AFL statistics.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && totalPicks > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 32, padding: '20px 24px', background: '#080808', border: '1px solid #1a1a1a', borderRadius: 12 }}>
            {[
              { label: 'HC Picks', value: totalPicks.toString(), color: '#f0f0f0' },
              { label: 'Wins', value: totalWins.toString(), color: '#4ade80' },
              { label: 'Losses', value: totalLosses.toString(), color: '#f87171' },
              { label: 'Strike Rate', value: `${overallWR}%`, color: '#f97316' },
              { label: 'Gross P&L', value: `${totalPL >= 0 ? '+' : ''}$${Math.abs(Math.round(totalPL)).toLocaleString()}`, color: totalPL >= 0 ? '#4ade80' : '#f87171' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Round-by-round */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>Loading picks...</div>
        ) : rounds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>No picks in the record yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rounds.map(rg => {
              const isExpanded = expandedRound === rg.round
              const isPending = rg.pending > 0 && rg.wins + rg.losses === 0
              return (
                <div key={rg.round} style={{ border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedRound(isExpanded ? null : rg.round)}
                    style={{
                      width: '100%', background: isExpanded ? '#080808' : '#050505',
                      border: 'none', cursor: 'pointer', padding: '16px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Round {rg.round}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{rg.picks.length} HC picks</span>
                      {isPending && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#888', background: '#111', border: '1px solid #222', borderRadius: 4, padding: '2px 8px' }}>IN PROGRESS</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {rg.wins + rg.losses > 0 && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: rg.winRate >= 65 ? '#22c55e' : '#f97316' }}>
                          {rg.winRate}%
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: rg.netPL >= 0 ? '#22c55e' : '#ef4444' }}>
                        {rg.netPL >= 0 ? '+' : ''}${Math.abs(Math.round(rg.netPL)).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, color: '#555' }}>
                        {rg.wins}W · {rg.losses}L{rg.pending > 0 ? ` · ${rg.pending} pending` : ''}
                      </span>
                      <span style={{ fontSize: 14, color: '#444' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ background: '#030303', borderTop: '1px solid #0d0d0d' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #0d0d0d' }}>
                              {['Player', 'Team / Pos', 'Pick', 'E/V', 'Final', 'Result', 'P&L'].map(h => (
                                <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#555', fontWeight: 600, textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rg.picks.map(p => (
                              <tr key={p.id} style={{ borderBottom: '1px solid #080808' }}>
                                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>{p.player_name}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#666' }}>{p.team} · {p.position}</td>
                                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: p.prediction === 'OVER' ? '#22c55e' : '#ef4444' }}>
                                  {p.prediction} {p.line}
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#60a5fa' }}>{p.edge_vol?.toFixed(2) ?? '-'}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#888' }}>
                                  {p.final_disposals !== null ? `${p.final_disposals}` : '—'}
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: p.result === 'WIN' ? '#4ade80' : p.result === 'LOSS' ? '#f87171' : '#555' }}>
                                  {p.result ?? 'Pending'}
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: (p.profit_loss ?? 0) >= 0 ? '#4ade80' : '#f87171' }}>
                                  {p.profit_loss !== null ? `${p.profit_loss >= 0 ? '+' : ''}$${Math.abs(p.profit_loss).toLocaleString()}` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #111' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/accuracy" style={{ fontSize: 13, color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
              Full Track Record →
            </Link>
            <Link href="/predictions" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>
              This Week&apos;s Picks →
            </Link>
          </div>
          <p style={{ fontSize: 11, color: '#444', marginTop: 16, lineHeight: 1.8 }}>
            Analytics only · Not financial advice · 18+ · Gamble responsibly · P&L calculated at $1,000 flat stake
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
