import resultsData from '@/data/results.json'
import predictionsData from '@/data/predictions.json'
import siteConfig from '@/data/site_config.json'

export const currentRound   = siteConfig.current_round
export const currentSeason  = siteConfig.current_season

const ss = resultsData.season_summary
export const totalPicks    = ss.total_picks
export const overallRate   = ss.overall_rate
export const filteredRate  = ss.filtered_rate
export const filteredPicks = ss.filtered_picks
export const strongRate    = ss.strong_rate
export const strongPicks   = ss.strong_picks

export const roundsTracked = (resultsData.rounds as Array<{ round: number }>).map(r => r.round)
export const firstRound    = Math.min(...roundsTracked)
export const lastRound     = Math.max(...roundsTracked)
export const roundsLabel   = `Rounds ${firstRound}–${lastRound}`
