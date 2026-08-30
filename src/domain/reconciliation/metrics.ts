import type { ReconciliationCase, Transaction } from '@/schemas/reconciliation'
import { parseBdtToPoisha } from './money'
import type { Match, Metrics, ReviewItem } from './types'

export function buildMetrics(
  input: ReconciliationCase,
  matched: Match[],
  review: ReviewItem[],
  unmatched: { pos: Transaction[]; settlement: Transaction[] }
): Metrics {
  const reviewPos = uniqueTransactions(review.map((item) => item.pos))
  const reviewSettlement = uniqueTransactions(review.flatMap((item) => item.candidates.map((candidate) => candidate.settlement)))

  return {
    posCount: input.pos.length,
    settlementCount: input.settlement.length,
    matchedCount: matched.length,
    reviewCount: review.length,
    reviewPosCount: reviewPos.length,
    reviewSettlementCount: reviewSettlement.length,
    unmatchedPosCount: unmatched.pos.length,
    unmatchedSettlementCount: unmatched.settlement.length,
    matchedPosValue: sumRows(matched.map((match) => match.pos)),
    matchedSettlementValue: sumRows(matched.map((match) => match.settlement)),
    reviewPosValue: sumRows(reviewPos),
    reviewSettlementValue: sumRows(reviewSettlement),
    unmatchedPosValue: sumRows(unmatched.pos),
    unmatchedSettlementValue: sumRows(unmatched.settlement),
    posTotal: sumRows(input.pos),
    settlementTotal: sumRows(input.settlement)
  }
}

function sumRows(rows: Transaction[]): number {
  return rows.reduce((sum, row) => sum + parseBdtToPoisha(row.amount_bdt), 0)
}

function uniqueTransactions(rows: Transaction[]): Transaction[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })
}
