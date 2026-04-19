// TODO: Gate behind Pro subscription in Phase 3

export interface ModelWeights {
  w_2025: number
  w_2026: number
  opp_sensitivity: number
  tog_sensitivity: number
  cba_sensitivity: number
  play_style_sensitivity: number
  team_style_sensitivity: number
  stop_multiplier_dry: number
  trans_multiplier_dry: number
  stop_multiplier_wet: number
  trans_multiplier_wet: number
  rules_boost_mid: number
  rules_boost_def: number
  rules_boost_fwd: number
  rules_boost_ruck: number
  cba_dampening: number
  strong_threshold_mid: number
  strong_threshold_def: number
  strong_threshold_fwd: number
  strong_threshold_ruck: number
  premium_line_threshold: number
  premium_edge_bonus: number
  edge_vol_threshold: number
}

export const DEFAULT_WEIGHTS: ModelWeights = {
  w_2025: 0.35, w_2026: 0.65,
  opp_sensitivity: 0.25, tog_sensitivity: 0.40,
  cba_sensitivity: 0.10, play_style_sensitivity: 0.60,
  team_style_sensitivity: 0.06,
  stop_multiplier_dry: 0.90, trans_multiplier_dry: 1.05,
  stop_multiplier_wet: 1.04, trans_multiplier_wet: 0.95,
  rules_boost_mid: 1.02, rules_boost_def: 1.03,
  rules_boost_fwd: 1.02, rules_boost_ruck: 0.90,
  cba_dampening: 0.10,
  strong_threshold_mid: 3.0, strong_threshold_def: 3.0,
  strong_threshold_fwd: 4.5, strong_threshold_ruck: 5.0,
  premium_line_threshold: 27, premium_edge_bonus: 2.0,
  edge_vol_threshold: 0.50,
}

// Grid search optimal weights (based on R3-R5 backtest)
export const OPTIMISED_WEIGHTS: ModelWeights = {
  ...DEFAULT_WEIGHTS,
  stop_multiplier_dry: 0.91,
  cba_dampening: 0.10,
  opp_sensitivity: 0.30,
  premium_edge_bonus: 2.0,
}

export interface RawInputs {
  avg_2025: number
  avg_2026: number
  opp_adjustment_factor: number
  tog_rate: number
  team_style_index: number
  cba_pct: number
  league_avg_cba: number
  play_style: string
  condition: string
  expected_tog: number
  rules_boost: number
  current_round: number
  std_dev: number
}

export interface SimulatedPick {
  player: string
  position: string
  team: string
  round: number
  line: number
  actual: number
  original_predicted: number
  new_predicted: number
  original_edge: number
  new_edge: number
  original_confidence: string
  new_confidence: string
  original_edge_vol: number
  new_edge_vol: number
  original_signal: string
  new_signal: string
  original_result: string
  new_result: string
  outcome_changed: boolean
  confidence_changed: boolean
}

export interface SimStats {
  total: number
  totalWins: number
  totalWinRate: number
  filteredTotal: number
  filteredWins: number
  filteredWinRate: number
  strongTotal: number
  strongWins: number
  strongWinRate: number
}

function getPlayStyleMultiplier(playStyle: string, condition: string, weights: ModelWeights): number {
  const isWet = condition === 'Wet'
  if (playStyle === 'TRANS') {
    const base = isWet ? weights.trans_multiplier_wet : weights.trans_multiplier_dry
    return 1 + (base - 1) * weights.play_style_sensitivity
  }
  if (playStyle === 'STOP') {
    const base = isWet ? weights.stop_multiplier_wet : weights.stop_multiplier_dry
    return 1 + (base - 1) * weights.play_style_sensitivity
  }
  return 1.0
}

function getRulesBoost(position: string, weights: ModelWeights): number {
  switch (position) {
    case 'MID': return weights.rules_boost_mid
    case 'DEF': return weights.rules_boost_def
    case 'FWD': return weights.rules_boost_fwd
    case 'RUCK': return weights.rules_boost_ruck
    default: return 1.02
  }
}

function getStrongThreshold(position: string, line: number, weights: ModelWeights): number {
  let base: number
  switch (position) {
    case 'MID': base = weights.strong_threshold_mid; break
    case 'DEF': base = weights.strong_threshold_def; break
    case 'FWD': base = weights.strong_threshold_fwd; break
    case 'RUCK': base = weights.strong_threshold_ruck; break
    default: base = 3.0
  }
  if (line >= weights.premium_line_threshold) base += weights.premium_edge_bonus
  return base
}

function getConfidence(edge: number, position: string, line: number, weights: ModelWeights): string {
  const absEdge = Math.abs(edge)
  const strongThreshold = getStrongThreshold(position, line, weights)
  if (absEdge >= strongThreshold) return 'STRONG'
  if (absEdge >= 1.5) return 'MODERATE'
  return 'LEAN'
}

export function simulatePick(
  inputs: RawInputs,
  position: string,
  line: number,
  weights: ModelWeights
): { predicted: number; edge: number; confidence: string; edge_vol: number; signal: string } {
  const baseAvg = inputs.avg_2025 > 0 && inputs.avg_2026 > 0
    ? inputs.avg_2025 * weights.w_2025 + inputs.avg_2026 * weights.w_2026
    : inputs.avg_2026 || inputs.avg_2025

  const oppEffect = (inputs.opp_adjustment_factor - 1.0) * weights.opp_sensitivity
  const oppAdjusted = baseAvg * (1 + oppEffect)

  const togRate = (inputs.avg_2026 || inputs.avg_2025) / 0.82 * inputs.expected_tog

  const styleAdj = (inputs.team_style_index / 100) * weights.team_style_sensitivity

  const playStyleMult = getPlayStyleMultiplier(inputs.play_style, inputs.condition, weights)
  const rulesMult = getRulesBoost(position, weights)

  let cbaAdj = 0
  if (inputs.cba_pct > 0 && inputs.league_avg_cba > 0) {
    const cbaRatio = Math.min(2.0, Math.max(0.5, inputs.cba_pct / inputs.league_avg_cba))
    cbaAdj = weights.cba_dampening * (cbaRatio - 1) * baseAvg * weights.cba_sensitivity
  }

  const remainder = Math.max(0, 1 - weights.opp_sensitivity - weights.tog_sensitivity)
  const predicted = (
    oppAdjusted * weights.opp_sensitivity +
    togRate * weights.tog_sensitivity +
    baseAvg * remainder
  ) * playStyleMult * rulesMult + styleAdj + cbaAdj

  const finalPredicted = Math.max(1, Math.round(predicted * 10) / 10)
  const edge = Math.round((finalPredicted - line) * 10) / 10
  const confidence = getConfidence(edge, position, line, weights)
  const edgeVol = inputs.std_dev > 0
    ? Math.round((Math.abs(edge) / inputs.std_dev) * 1000) / 1000
    : 0
  const signal = edge >= 0 ? 'OVER' : 'UNDER'

  return { predicted: finalPredicted, edge, confidence, edge_vol: edgeVol, signal }
}

export function simulateAllPicks(historicalPicks: RawHistoricalPick[], weights: ModelWeights): SimulatedPick[] {
  return historicalPicks
    .filter(p => p.raw_inputs != null)
    .map(pick => {
      const sim = simulatePick(pick.raw_inputs!, pick.position, pick.line, weights)

      const newCorrect =
        (sim.signal === 'OVER' && pick.actual > pick.line) ||
        (sim.signal === 'UNDER' && pick.actual < pick.line)
      const newResult = newCorrect ? 'WIN' : 'LOSS'

      const origEdge = pick.predicted != null
        ? Math.round((pick.predicted - pick.line) * 10) / 10
        : (pick.signal === 'OVER' ? 3 : -3)

      return {
        player: pick.player,
        position: pick.position,
        team: pick.team,
        round: pick.round ?? 0,
        line: pick.line,
        actual: pick.actual,
        original_predicted: pick.predicted ?? pick.line,
        new_predicted: sim.predicted,
        original_edge: origEdge,
        new_edge: sim.edge,
        original_confidence: pick.confidence,
        new_confidence: sim.confidence,
        original_edge_vol: pick.edge_vol,
        new_edge_vol: sim.edge_vol,
        original_signal: pick.signal,
        new_signal: sim.signal,
        original_result: pick.result,
        new_result: newResult,
        outcome_changed: newResult !== pick.result,
        confidence_changed: sim.confidence !== pick.confidence,
      }
    })
}

export function calcSimStats(picks: SimulatedPick[], weights: ModelWeights): SimStats {
  const filtered = picks.filter(p => p.new_edge_vol >= weights.edge_vol_threshold && p.position !== 'FWD')
  const strong = picks.filter(p => p.new_confidence === 'STRONG' && p.position !== 'FWD')
  const allWins = picks.filter(p => p.new_result === 'WIN')

  return {
    total: picks.length,
    totalWins: allWins.length,
    totalWinRate: picks.length ? Math.round(allWins.length / picks.length * 1000) / 10 : 0,
    filteredTotal: filtered.length,
    filteredWins: filtered.filter(p => p.new_result === 'WIN').length,
    filteredWinRate: filtered.length
      ? Math.round(filtered.filter(p => p.new_result === 'WIN').length / filtered.length * 1000) / 10
      : 0,
    strongTotal: strong.length,
    strongWins: strong.filter(p => p.new_result === 'WIN').length,
    strongWinRate: strong.length
      ? Math.round(strong.filter(p => p.new_result === 'WIN').length / strong.length * 1000) / 10
      : 0,
  }
}

export function calcOriginalStats(picks: RawHistoricalPick[]): SimStats {
  const withData = picks.filter(p => p.raw_inputs != null)
  const filtered = withData.filter(p => p.edge_vol >= DEFAULT_WEIGHTS.edge_vol_threshold && p.position !== 'FWD')
  const strong = withData.filter(p => p.confidence === 'STRONG' && p.position !== 'FWD')
  const allWins = withData.filter(p => p.result === 'WIN')

  return {
    total: withData.length,
    totalWins: allWins.length,
    totalWinRate: withData.length ? Math.round(allWins.length / withData.length * 1000) / 10 : 0,
    filteredTotal: filtered.length,
    filteredWins: filtered.filter(p => p.result === 'WIN').length,
    filteredWinRate: filtered.length
      ? Math.round(filtered.filter(p => p.result === 'WIN').length / filtered.length * 1000) / 10
      : 0,
    strongTotal: strong.length,
    strongWins: strong.filter(p => p.result === 'WIN').length,
    strongWinRate: strong.length
      ? Math.round(strong.filter(p => p.result === 'WIN').length / strong.length * 1000) / 10
      : 0,
  }
}

// Type for raw historical picks as stored in results.json
export interface RawHistoricalPick {
  player: string
  position: string
  team: string
  round?: number
  line: number
  predicted?: number
  actual: number
  signal: string
  confidence: string
  edge_vol: number
  result: string
  raw_inputs?: RawInputs
}
