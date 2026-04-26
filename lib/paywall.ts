export function getFreeTierPickCount(): number {
  return 1;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterPicksForTier(picks: any[], isPro: boolean): any[] {
  if (isPro) return picks;
  return [...picks]
    .sort((a, b) => (b.edge_vol ?? 0) - (a.edge_vol ?? 0))
    .slice(0, 1);
}

export function shouldShowProPrompt(isPro: boolean): boolean {
  return !isPro;
}
