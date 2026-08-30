import type { ReconciliationCase } from '@/schemas/reconciliation'
import { parseBdtToPoisha } from './money'
import type { Metrics } from './types'

export function buildSkeletonMetrics(input: ReconciliationCase): Metrics {
  const posTotal = input.pos.reduce((sum, row) => sum + parseBdtToPoisha(row.amount_bdt), 0)
  const settlementTotal = input.settlement.reduce((sum, row) => sum + parseBdtToPoisha(row.amount_bdt), 0)
  return {
    posCount: input.pos.length,
    settlementCount: input.settlement.length,
    matchedCount: 0,
    reviewCount: 0,
    unmatchedPosCount: input.pos.length,
    unmatchedSettlementCount: input.settlement.length,
    matchedPosValue: 0,
    matchedSettlementValue: 0,
    unmatchedPosValue: posTotal,
    unmatchedSettlementValue: settlementTotal,
    posTotal,
    settlementTotal
  }
}
