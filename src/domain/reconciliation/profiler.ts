import type { ReconciliationCase } from '@/schemas/reconciliation'
import { detectReferenceStyle } from './reference'

function duplicateCount(rows: ReconciliationCase['pos']): number {
  const seen = new Set<string>()
  let duplicates = 0
  for (const row of rows) {
    const key = `${row.reference}|${row.amount_bdt}|${row.time}`
    if (seen.has(key)) duplicates += 1
    seen.add(key)
  }
  return duplicates
}

export function profileCase(input: ReconciliationCase) {
  return {
    referenceStyle: detectReferenceStyle(input.settlement.map((row) => row.reference)),
    afterMidnightCount: input.settlement.filter((row) => row.time.slice(0, 10) > input.today).length,
    duplicatePosCount: duplicateCount(input.pos),
    duplicateSettlementCount: duplicateCount(input.settlement)
  }
}
