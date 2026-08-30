import type { PairDecision } from '@/schemas/reconciliation'

export function pairKey(pair: PairDecision): string {
  return `${pair.posId}::${pair.settlementId}`
}
