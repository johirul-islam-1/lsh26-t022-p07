import type { PairDecision, Transaction } from '@/schemas/reconciliation'
import { evaluateSignals, weightedSignalScore } from './signals'
import type { Fingerprint, Match, MatchType } from './types'

export function pairKey(pair: PairDecision): string {
  return `${pair.posId}::${pair.settlementId}`
}

export function applyForcedDecisions(
  posRows: Transaction[],
  settlementRows: Transaction[],
  accepted: PairDecision[],
  manual: PairDecision[],
  fingerprint: Fingerprint
): { matches: Match[]; usedPos: Set<string>; usedSettlement: Set<string>; warnings: string[] } {
  const posById = new Map(posRows.map((row) => [row.id, row]))
  const settlementById = new Map(settlementRows.map((row) => [row.id, row]))
  const usedPos = new Set<string>()
  const usedSettlement = new Set<string>()
  const matches: Match[] = []
  const warnings: string[] = []

  for (const [type, decisions] of [['MANUAL', manual], ['ACCEPTED', accepted]] as const) {
    for (const decision of decisions) {
      const pos = posById.get(decision.posId)
      const settlement = settlementById.get(decision.settlementId)
      if (!pos || !settlement) {
        warnings.push(`${type}: ignored unknown pair ${decision.posId} ↔ ${decision.settlementId}`)
        continue
      }
      if (usedPos.has(pos.id) || usedSettlement.has(settlement.id)) {
        warnings.push(`${type}: ignored duplicate-use pair ${decision.posId} ↔ ${decision.settlementId}`)
        continue
      }
      matches.push(forcedMatch(pos, settlement, fingerprint, type))
      usedPos.add(pos.id)
      usedSettlement.add(settlement.id)
    }
  }

  return { matches, usedPos, usedSettlement, warnings }
}

function forcedMatch(pos: Transaction, settlement: Transaction, fingerprint: Fingerprint, type: MatchType): Match {
  const evidence = evaluateSignals(pos, settlement, fingerprint)
  const confidence = weightedSignalScore(evidence.signals)
  return {
    pos,
    settlement,
    confidence,
    type,
    signals: evidence.signals,
    expectedSettlementAmount: evidence.expectedSettlementAmount,
    expectedSettlementTime: evidence.expectedSettlementTime,
    amountDifference: evidence.amountDifference,
    timeDifferenceMinutes: evidence.timeDifferenceMinutes,
    safety: {
      mutualBest: false,
      margin: 0,
      uniqueCandidate: false,
      noDuplicateConflict: false
    },
    explanation: [
      type === 'MANUAL' ? 'Paired explicitly by the reviewer.' : 'Accepted explicitly from the review queue.',
      'Human decisions are authoritative and are never presented as automatic confidence.'
    ]
  }
}
