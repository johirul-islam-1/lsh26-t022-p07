import { MATCH_CONFIG } from './config'
import type { MatchCandidate, ReviewReason } from './types'

export function hasCompetingCandidate(ids: string[]): boolean {
  return new Set(ids).size < ids.length
}

export function classifyReviewReason(candidate: MatchCandidate, candidates: MatchCandidate[]): ReviewReason {
  if (candidate.duplicateConflict) return 'DUPLICATE_CONFLICT'
  if (candidates.length > 1 && Math.abs(candidate.score - (candidates[1]?.score ?? 0)) < MATCH_CONFIG.minimumMargin) {
    return 'MULTIPLE_PLAUSIBLE_MATCHES'
  }
  if (candidate.signals.reference >= 0.8 && candidate.signals.amount < 0.6) return 'AMOUNT_OUTLIER'
  if (candidate.signals.reference >= 0.8 && candidate.signals.amount >= 0.8 && candidate.signals.time < 0.6) return 'TIME_OUTLIER'
  return 'UNEXPLAINED'
}
