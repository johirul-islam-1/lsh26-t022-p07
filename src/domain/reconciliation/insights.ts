import type { ReconciliationResult, ReviewReason } from './types'
import { canonicalizeReference } from './reference'

export interface FinancialSnapshot {
  resolutionRate: number
  autoMatchedCount: number
  reviewerAcceptedCount: number
  manualMatchedCount: number
  unresolvedPosValue: number
  matchedGrossValue: number
  matchedSettlementValue: number
  matchedGrossNetGap: number
  estimatedLearnedFeeValue: number | null
  highPriorityReviewCount: number
}

export interface ExceptionBucket {
  code: ReviewReason
  count: number
}

export function buildFinancialSnapshot(result: ReconciliationResult): FinancialSnapshot {
  const autoMatchedCount = result.matched.filter((match) => match.type === 'AUTO').length
  const reviewerAcceptedCount = result.matched.filter((match) => match.type === 'ACCEPTED').length
  const manualMatchedCount = result.matched.filter((match) => match.type === 'MANUAL').length
  const resolutionRate = result.metrics.posCount === 0 ? 0 : result.metrics.matchedCount / result.metrics.posCount
  const unresolvedPosValue = result.metrics.reviewPosValue + result.metrics.unmatchedPosValue
  const matchedGrossNetGap = result.metrics.matchedPosValue - result.metrics.matchedSettlementValue
  const estimatedLearnedFeeValue = result.fingerprint.settlementFee === null
    ? null
    : Math.round(result.metrics.matchedPosValue * result.fingerprint.settlementFee)

  return {
    resolutionRate,
    autoMatchedCount,
    reviewerAcceptedCount,
    manualMatchedCount,
    unresolvedPosValue,
    matchedGrossValue: result.metrics.matchedPosValue,
    matchedSettlementValue: result.metrics.matchedSettlementValue,
    matchedGrossNetGap,
    estimatedLearnedFeeValue,
    highPriorityReviewCount: result.review.filter((item) => item.priority === 'HIGH').length
  }
}

export function buildExceptionBuckets(result: ReconciliationResult): ExceptionBucket[] {
  const counts = new Map<ReviewReason, number>()
  const add = (code: ReviewReason, amount = 1) => counts.set(code, (counts.get(code) ?? 0) + amount)

  for (const item of result.review) add(item.reason)

  for (const row of result.unmatched.pos) {
    add(canonicalizeReference(row.reference) ? 'MISSING_SETTLEMENT' : 'REFERENCE_PARSE_FAILURE')
  }

  for (const row of result.unmatched.settlement) {
    add(canonicalizeReference(row.reference) ? 'MISSING_POS' : 'REFERENCE_PARSE_FAILURE')
  }

  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((left, right) => right.count - left.count || left.code.localeCompare(right.code))
}

export function buildEndOfDaySummary(result: ReconciliationResult): string {
  const snapshot = buildFinancialSnapshot(result)
  const fee = result.fingerprint.settlementFee === null
    ? 'no stable fee learned'
    : `${(result.fingerprint.settlementFee * 100).toFixed(2)}% learned fee`
  const offset = result.fingerprint.timeOffsetMinutes === null
    ? 'no stable clock shift learned'
    : `${formatOffset(result.fingerprint.timeOffsetMinutes)} learned clock shift`

  return `${result.case.id}: ${result.metrics.matchedCount}/${result.metrics.posCount} POS rows resolved (${Math.round(snapshot.resolutionRate * 100)}%); ${result.metrics.reviewCount} review item(s), ${result.metrics.unmatchedPosCount} unmatched POS and ${result.metrics.unmatchedSettlementCount} unmatched settlement record(s); ${fee}; ${offset}.`
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '−'
  const absolute = Math.abs(minutes)
  const hours = Math.floor(absolute / 60)
  const remainder = Math.round(absolute % 60)
  return remainder === 0 ? `${sign}${hours}h` : `${sign}${hours}h ${remainder}m`
}
