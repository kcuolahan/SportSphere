interface PnLData {
  totalBets: number
  wins: number
  losses: number
  totalStaked: number
  netProfitBeforeFees: number
  monthlySubscriptionFee: number
  durationMonths: number
}

export function calculateROI(data: PnLData) {
  const totalFees = data.monthlySubscriptionFee * data.durationMonths
  const netProfitAfterFees = data.netProfitBeforeFees - totalFees
  const roiBeforeFees = (data.netProfitBeforeFees / data.totalStaked) * 100
  const roiAfterFees = (netProfitAfterFees / data.totalStaked) * 100
  const profitPerBet = netProfitAfterFees / data.totalBets

  return {
    grossProfit: data.netProfitBeforeFees,
    totalFees,
    netProfit: netProfitAfterFees,
    roiBefore: roiBeforeFees,
    roiAfter: roiAfterFees,
    profitPerBet,
    breakeven: data.totalFees,
  }
}
