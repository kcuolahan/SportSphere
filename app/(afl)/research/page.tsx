'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useProAccess } from '@/lib/auth'

// ── Types ────────────────────────────────────────────────────────────────────

interface Prediction {
  id: string
  round: number
  season: number
  player: string
  team: string
  opponent: string
  position: string | null
  effective_position: string | null
  bookie_line: number | null
  predicted_line: number | null
  edge: number | null
  signal: string | null
  confidence: string | null
  enhanced_signal: string | null
  edge_vol_score: number | null
  est_std_dev: number | null
  pos_threshold: number | null
  bet_score: number | null
  pred_tog: number | null
  avg_2025: number | null
  avg_2026: number | null
  blended_avg: number | null
  opp_factor: number | null
  tog_rate: number | null
  cba_adj: number | null
  style: string | null
  conditions: string | null
  rules_boost: number | null
  avail_boost: number | null
  form_indicator: string | null
  games: number | null
  venue: string | null
  game_id: string | null
  game_time: string | null
  last5_disposals: number | null
  divergence_pct: number | null
  context_flag: string | null
  sample_confidence: number | null
  role_swap: string | null
  avg_cba_pct: number | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SIGNAL_ORDER: Record<string, number> = {
  'HC': 0, 'BET': 1, 'LEAN': 2, 'MOD': 3, 'SKIP': 4, 'FWD-NO-BET': 5,
}

function signalColor(sig: string | null) {
  switch (sig) {
    case 'HC': return 'border-l-[#f97316] bg-[#f97316]/5'
    case 'BET': return 'border-l-[#3b82f6] bg-[#3b82f6]/5'
    case 'LEAN': return 'border-l-[#a78bfa] bg-[#a78bfa]/5'
    case 'MOD': return 'border-l-[#eab308] bg-[#eab308]/5'
    case 'FWD-NO-BET': return 'border-l-[#555] bg-transparent opacity-50'
    default: return 'border-l-[#333] bg-transparent'
  }
}

function signalBadge(sig: string | null) {
  switch (sig) {
    case 'HC': return 'bg-[#f97316] text-black'
    case 'BET': return 'bg-[#3b82f6] text-white'
    case 'LEAN': return 'bg-[#a78bfa] text-black'
    case 'MOD': return 'bg-[#eab308] text-black'
    case 'FWD-NO-BET': return 'bg-[#333] text-[#888]'
    default: return 'bg-[#2a2a2a] text-[#888]'
  }
}

function fmt1(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toFixed(1)
}

function fmt2(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toFixed(2)
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return '—'
  return `${(n * 100).toFixed(1)}%`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ResearchTerminalPage() {
  const { isPro, isLoggedIn, loading: proLoading } = useProAccess()

  const [round, setRound] = useState(8)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState<'ALL' | 'MID' | 'DEF' | 'FWD' | 'RUCK'>('ALL')
  const [signalFilter, setSignalFilter] = useState('ALL')
  const [gameFilter, setGameFilter] = useState('ALL')
  const [minEV, setMinEV] = useState(0)

  // Sort
  const [sortCol, setSortCol] = useState<string>('edge_vol_score')
  const [sortAsc, setSortAsc] = useState(false)

  // Expand
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Pagination
  const PAGE_SIZE = 50
  const [page, setPage] = useState(0)
  const [showAll, setShowAll] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPredictions = useCallback(async (r: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/predictions-full?round=${r}&season=2026`)
      const json = await res.json()
      setPredictions(json.predictions ?? [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPredictions(round) }, [round, fetchPredictions])

  // ── Derived: unique games ─────────────────────────────────────────────────

  const uniqueGames = useMemo(() => {
    const seen = new Set<string>()
    return predictions
      .map(p => p.game_id ?? p.team)
      .filter(g => { if (seen.has(g)) return false; seen.add(g); return true })
  }, [predictions])

  // ── Filtered + sorted rows ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = predictions

    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(p => p.player.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
    }

    if (posFilter !== 'ALL') {
      rows = rows.filter(p => (p.effective_position ?? p.position) === posFilter)
    }

    if (signalFilter !== 'ALL') {
      rows = rows.filter(p => p.enhanced_signal === signalFilter || p.signal === signalFilter)
    }

    if (gameFilter !== 'ALL') {
      rows = rows.filter(p => (p.game_id ?? p.team) === gameFilter)
    }

    if (minEV > 0) {
      rows = rows.filter(p => (p.edge_vol_score ?? 0) >= minEV)
    }

    rows = [...rows].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortCol]
      const bv = (b as unknown as Record<string, unknown>)[sortCol]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = (SIGNAL_ORDER[av] ?? 99) - (SIGNAL_ORDER[bv] ?? 99)
        if (sortCol === 'enhanced_signal' || sortCol === 'signal') return sortAsc ? -cmp : cmp
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

    return rows
  }, [predictions, search, posFilter, signalFilter, gameFilter, minEV, sortCol, sortAsc])

  // ── Stats strip ───────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const hc = filtered.filter(p => p.enhanced_signal === 'HC' || p.signal === 'HC').length
    const bet = filtered.filter(p => p.enhanced_signal === 'BET' || p.signal === 'BET').length
    const skip = filtered.filter(p => p.enhanced_signal === 'SKIP' || p.signal === 'SKIP').length
    const evs = filtered.map(p => p.edge_vol_score).filter(Boolean) as number[]
    const avgEV = evs.length ? evs.reduce((a, b) => a + b, 0) / evs.length : 0
    return { total: filtered.length, hc, bet, skip, avgEV }
  }, [filtered])

  // ── Pagination ────────────────────────────────────────────────────────────

  const displayed = useMemo(() => {
    if (showAll && isPro) return filtered
    return filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  }, [filtered, page, showAll, isPro])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  // ── Sort handler ──────────────────────────────────────────────────────────

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortAsc(prev => !prev)
    } else {
      setSortCol(col)
      setSortAsc(false)
    }
    setPage(0)
  }

  function SortArrow({ col }: { col: string }) {
    if (sortCol !== col) return <span className="text-[#444] ml-1">↕</span>
    return <span className="text-[#f97316] ml-1">{sortAsc ? '↑' : '↓'}</span>
  }

  // ── Blur helper ───────────────────────────────────────────────────────────

  function blurNum(val: string) {
    if (isPro) return <span>{val}</span>
    return (
      <span style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
        {val}
      </span>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-black">Research Terminal</h1>
          <span className="bg-[#f97316] text-black text-xs font-black px-2 py-0.5 rounded">PRO</span>
        </div>
        <p className="text-[#666] text-sm">Full model output — all evaluated players this round.</p>
      </div>

      {/* Non-Pro CTA */}
      {!proLoading && !isPro && (
        <div className="mb-6 bg-[#1a1a1a] border border-[#f97316]/30 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white mb-1">Upgrade to Pro to unlock Research Terminal</div>
              <div className="text-sm text-[#888]">
                See all ~180 evaluated players, full factor breakdowns, E/V scores, and signals.
                Numeric values are blurred below until you upgrade.
              </div>
            </div>
            <a
              href="/auth/payment"
              className="shrink-0 bg-[#f97316] hover:bg-[#ea580c] text-black font-black text-sm px-5 py-3 rounded-lg text-center"
            >
              Unlock — $29/mo
            </a>
          </div>
        </div>
      )}

      {/* Round selector + filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="text-xs text-[#666] block mb-1">Round</label>
          <select
            value={round}
            onChange={e => { setRound(parseInt(e.target.value)); setPage(0) }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2"
          >
            {Array.from({ length: 23 }, (_, i) => i + 1).map(r => (
              <option key={r} value={r}>Round {r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-[#666] block mb-1">Search</label>
          <input
            type="text"
            placeholder="Player or team..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2 w-44"
          />
        </div>

        <div>
          <label className="text-xs text-[#666] block mb-1">Position</label>
          <select
            value={posFilter}
            onChange={e => { setPosFilter(e.target.value as typeof posFilter); setPage(0) }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2"
          >
            {['ALL', 'MID', 'DEF', 'FWD', 'RUCK'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-[#666] block mb-1">Signal</label>
          <select
            value={signalFilter}
            onChange={e => { setSignalFilter(e.target.value); setPage(0) }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2"
          >
            {['ALL', 'HC', 'BET', 'LEAN', 'MOD', 'SKIP', 'FWD-NO-BET'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-[#666] block mb-1">Game</label>
          <select
            value={gameFilter}
            onChange={e => { setGameFilter(e.target.value); setPage(0) }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2"
          >
            <option value="ALL">All Games</option>
            {uniqueGames.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-[#666] block mb-1">Min E/V ≥ {minEV.toFixed(2)}</label>
          <input
            type="range" min={0} max={2} step={0.05}
            value={minEV}
            onChange={e => { setMinEV(parseFloat(e.target.value)); setPage(0) }}
            className="w-28 accent-[#f97316]"
          />
        </div>

        {(search || posFilter !== 'ALL' || signalFilter !== 'ALL' || gameFilter !== 'ALL' || minEV > 0) && (
          <button
            onClick={() => { setSearch(''); setPosFilter('ALL'); setSignalFilter('ALL'); setGameFilter('ALL'); setMinEV(0); setPage(0) }}
            className="text-xs text-[#f97316] hover:text-white border border-[#f97316]/30 hover:border-[#f97316] px-3 py-2 rounded-lg self-end"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {[
          { label: 'Total', value: stats.total },
          { label: 'HC', value: stats.hc, color: 'text-[#f97316]' },
          { label: 'BET', value: stats.bet, color: 'text-[#3b82f6]' },
          { label: 'SKIP', value: stats.skip, color: 'text-[#555]' },
          { label: 'Avg E/V', value: stats.avgEV.toFixed(2) },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
            <div className={`text-xl font-black ${s.color ?? 'text-white'}`}>{s.value}</div>
            <div className="text-xs text-[#666]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-[#555] text-center py-20">Loading predictions...</div>
      ) : error ? (
        <div className="text-red-400 text-center py-10">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-[#555] text-center py-20">No predictions found for round {round}.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#1e1e1e]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111] border-b border-[#1e1e1e] text-[#666] text-xs uppercase">
                  {[
                    { label: 'Player', col: 'player' },
                    { label: 'Team', col: 'team' },
                    { label: 'Opp', col: 'opponent' },
                    { label: 'Pos', col: 'effective_position' },
                    { label: 'Line', col: 'bookie_line' },
                    { label: 'Predicted', col: 'predicted_line' },
                    { label: 'Edge', col: 'edge' },
                    { label: 'E/V', col: 'edge_vol_score' },
                    { label: 'Signal', col: 'enhanced_signal' },
                    { label: 'Confidence', col: 'confidence' },
                  ].map(h => (
                    <th
                      key={h.col}
                      className="px-4 py-3 text-left font-semibold cursor-pointer select-none hover:text-white"
                      onClick={() => handleSort(h.col)}
                    >
                      {h.label}<SortArrow col={h.col} />
                    </th>
                  ))}
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => {
                  const sig = p.enhanced_signal ?? p.signal
                  const isExpanded = expandedId === p.id
                  const isFwdNoBet = sig === 'FWD-NO-BET'

                  return (
                    <>
                      <tr
                        key={p.id}
                        className={[
                          'border-b border-[#1a1a1a] border-l-2 cursor-pointer transition-colors',
                          signalColor(sig),
                          isFwdNoBet ? 'line-through' : '',
                          isExpanded ? 'bg-[#141414]' : 'hover:bg-[#111]',
                        ].join(' ')}
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        <td className="px-4 py-3 font-semibold text-white">{p.player}</td>
                        <td className="px-4 py-3 text-[#888]">{p.team}</td>
                        <td className="px-4 py-3 text-[#888]">{p.opponent}</td>
                        <td className="px-4 py-3 text-[#aaa]">{p.effective_position ?? p.position ?? '—'}</td>
                        <td className="px-4 py-3 text-[#aaa]">{fmt1(p.bookie_line)}</td>
                        <td className="px-4 py-3 font-mono">{blurNum(fmt1(p.predicted_line))}</td>
                        <td className={`px-4 py-3 font-mono font-semibold ${(p.edge ?? 0) > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                          {blurNum((p.edge != null ? ((p.edge > 0 ? '+' : '') + fmt1(p.edge)) : '—'))}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">{blurNum(fmt2(p.edge_vol_score))}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${signalBadge(sig)}`}>
                            {sig ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#888] text-xs">{p.confidence ?? '—'}</td>
                        <td className="px-4 py-3 text-[#555] text-base">
                          {isExpanded ? '▲' : '▼'}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${p.id}-detail`} className="bg-[#0f0f0f] border-b border-[#1a1a1a]">
                          <td colSpan={11} className="px-6 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">

                              {/* Averages */}
                              <div className="space-y-1.5">
                                <div className="text-[#f97316] font-bold uppercase tracking-wider mb-2">Averages</div>
                                <div className="flex justify-between"><span className="text-[#666]">Blended Avg</span><span>{blurNum(fmt1(p.blended_avg))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">2026 Avg</span><span>{blurNum(fmt1(p.avg_2026))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">2025 Avg</span><span>{blurNum(fmt1(p.avg_2025))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Last 5</span><span>{blurNum(fmt1(p.last5_disposals))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Games (sample)</span><span>{p.games ?? '—'}</span></div>
                              </div>

                              {/* Model factors */}
                              <div className="space-y-1.5">
                                <div className="text-[#3b82f6] font-bold uppercase tracking-wider mb-2">Model Factors</div>
                                <div className="flex justify-between"><span className="text-[#666]">Opp Factor</span><span>{blurNum(fmt2(p.opp_factor))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">TOG Rate</span><span>{blurNum(fmtPct(p.tog_rate))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Pred TOG</span><span>{blurNum(fmtPct(p.pred_tog))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">CBA Adj</span><span>{blurNum(fmt2(p.cba_adj))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Avg CBA %</span><span>{blurNum(fmtPct(p.avg_cba_pct))}</span></div>
                              </div>

                              {/* Signal metrics */}
                              <div className="space-y-1.5">
                                <div className="text-[#a78bfa] font-bold uppercase tracking-wider mb-2">Signal Metrics</div>
                                <div className="flex justify-between"><span className="text-[#666]">Bet Score</span><span>{blurNum(fmt2(p.bet_score))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Est Std Dev</span><span>{blurNum(fmt1(p.est_std_dev))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Pos Threshold</span><span>{blurNum(fmt2(p.pos_threshold))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Divergence</span><span>{blurNum(p.divergence_pct != null ? `${(p.divergence_pct).toFixed(1)}%` : '—')}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Sample Conf.</span><span>{p.sample_confidence ?? '—'}</span></div>
                              </div>

                              {/* Context */}
                              <div className="space-y-1.5">
                                <div className="text-[#4ade80] font-bold uppercase tracking-wider mb-2">Context</div>
                                <div className="flex justify-between"><span className="text-[#666]">Style</span><span className="text-right max-w-[120px] truncate">{p.style ?? '—'}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Conditions</span><span>{p.conditions ?? '—'}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Form</span><span>{p.form_indicator ?? '—'}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Rules Boost</span><span>{blurNum(fmt2(p.rules_boost))}</span></div>
                                <div className="flex justify-between"><span className="text-[#666]">Avail Boost</span><span>{blurNum(fmt2(p.avail_boost))}</span></div>
                                {p.context_flag && (
                                  <div className="flex justify-between"><span className="text-[#666]">Flag</span><span className="text-[#eab308]">{p.context_flag}</span></div>
                                )}
                                {p.role_swap && (
                                  <div className="flex justify-between"><span className="text-[#666]">Role</span><span className="text-[#f87171]">{p.role_swap}</span></div>
                                )}
                              </div>
                            </div>

                            {/* Venue + game */}
                            {(p.venue || p.game_id) && (
                              <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex gap-4 text-xs text-[#555]">
                                {p.venue && <span>Venue: <span className="text-[#888]">{p.venue}</span></span>}
                                {p.game_id && <span>Game: <span className="text-[#888]">{p.game_id}</span></span>}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-[#555]">
              Showing {showAll && isPro ? filtered.length : Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} players
            </div>
            <div className="flex items-center gap-3">
              {!showAll && totalPages > 1 && (
                <>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] disabled:opacity-30 hover:border-[#444]"
                  >
                    ← Prev
                  </button>
                  <span className="text-[#555]">{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] disabled:opacity-30 hover:border-[#444]"
                  >
                    Next →
                  </button>
                </>
              )}
              {isPro && !showAll && filtered.length > PAGE_SIZE && (
                <button
                  onClick={() => setShowAll(true)}
                  className="px-3 py-1.5 rounded-lg border border-[#f97316]/40 text-[#f97316] hover:bg-[#f97316]/10 text-xs"
                >
                  Show all {filtered.length}
                </button>
              )}
              {showAll && (
                <button
                  onClick={() => { setShowAll(false); setPage(0) }}
                  className="px-3 py-1.5 rounded-lg border border-[#333] text-[#888] hover:border-[#555] text-xs"
                >
                  Paginate
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
