export function calculateResult(
  prediction: 'OVER' | 'UNDER',
  finalDisposals: number,
  line: number,
  odds: number,
  stake: number = 1000,
) {
  const didHit = prediction === 'OVER' ? finalDisposals > line : finalDisposals < line

  if (didHit) {
    return {
      result: 'WIN',
      profitLoss: stake * (odds - 1),
      disposalDiff: prediction === 'OVER' ? finalDisposals - line : line - finalDisposals,
    }
  } else {
    return {
      result: 'LOSS',
      profitLoss: -stake,
      disposalDiff: prediction === 'OVER' ? finalDisposals - line : line - finalDisposals,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function roundResults(results: any[]) {
  const wins = results.filter(r => r.result === 'WIN').length
  const losses = results.filter(r => r.result === 'LOSS').length
  const totalProfit = results.reduce((sum, r) => sum + (r.profitLoss || 0), 0)

  return {
    totalBets: results.length,
    wins,
    losses,
    winRate: results.length > 0 ? wins / results.length : 0,
    totalProfit,
    roi: results.length > 0 ? (totalProfit / (results.length * 1000)) * 100 : 0,
  }
}
