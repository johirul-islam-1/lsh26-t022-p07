import type { ReconciliationCase, Transaction } from '@/schemas/reconciliation'
import { MATCH_CONFIG } from './config'
import { canonicalizeReference } from './reference'
import { evaluateSignals, weightedSignalScore } from './signals'
import type { Fingerprint, MatchCandidate } from './types'

export function buildCandidates(
  input: ReconciliationCase,
  fingerprint: Fingerprint,
  posRows: Transaction[],
  settlementRows: Transaction[],
  rejectedPairs: Set<string>
): MatchCandidate[] {
  const posMultiplicity = canonicalMultiplicity(input.pos)
  const settlementMultiplicity = canonicalMultiplicity(input.settlement)
  const base: MatchCandidate[] = []

  for (const pos of posRows) {
    for (const settlement of settlementRows) {
      if (rejectedPairs.has(`${pos.id}::${settlement.id}`)) continue
      const evidence = evaluateSignals(pos, settlement, fingerprint)
      const score = weightedSignalScore(evidence.signals)
      if (score < MATCH_CONFIG.candidateFloor) continue
      base.push({
        pos,
        settlement,
        score,
        ...evidence,
        posMargin: 0,
        settlementMargin: 0,
        mutualBest: false,
        duplicateConflict: isDuplicate(pos, settlement, posMultiplicity, settlementMultiplicity),
        reasons: []
      })
    }
  }

  const byPos = groupCandidates(base, (candidate) => candidate.pos.id)
  const bySettlement = groupCandidates(base, (candidate) => candidate.settlement.id)

  return base.map((candidate) => {
    const posRank = byPos.get(candidate.pos.id) ?? []
    const settlementRank = bySettlement.get(candidate.settlement.id) ?? []
    const posBest = posRank[0]
    const settlementBest = settlementRank[0]
    const posMargin = candidate.score - (posRank[1]?.score ?? 0)
    const settlementMargin = candidate.score - (settlementRank[1]?.score ?? 0)
    const mutualBest = posBest?.settlement.id === candidate.settlement.id
      && settlementBest?.pos.id === candidate.pos.id
      && candidate.score === posBest.score
      && candidate.score === settlementBest.score

    return {
      ...candidate,
      posMargin,
      settlementMargin,
      mutualBest,
      reasons: candidateReasons(candidate, mutualBest, posMargin, settlementMargin)
    }
  })
}

export function isAutoSafe(candidate: MatchCandidate): boolean {
  return candidate.score >= MATCH_CONFIG.autoThreshold
    && candidate.signals.reference >= MATCH_CONFIG.minimumAutoSignals.reference
    && candidate.signals.amount >= MATCH_CONFIG.minimumAutoSignals.amount
    && candidate.signals.time >= MATCH_CONFIG.minimumAutoSignals.time
    && candidate.mutualBest
    && Math.min(candidate.posMargin, candidate.settlementMargin) >= MATCH_CONFIG.minimumMargin
    && !candidate.duplicateConflict
}

export function candidatePairKey(candidate: MatchCandidate): string {
  return `${candidate.pos.id}::${candidate.settlement.id}`
}

function canonicalMultiplicity(rows: Transaction[]): Map<string, number> {
  const result = new Map<string, number>()
  for (const row of rows) {
    const key = canonicalizeReference(row.reference)?.key
    if (!key) continue
    result.set(key, (result.get(key) ?? 0) + 1)
  }
  return result
}

function isDuplicate(
  pos: Transaction,
  settlement: Transaction,
  posMultiplicity: Map<string, number>,
  settlementMultiplicity: Map<string, number>
): boolean {
  const posKey = canonicalizeReference(pos.reference)?.key
  const settlementKey = canonicalizeReference(settlement.reference)?.key
  return Boolean(
    (posKey && (posMultiplicity.get(posKey) ?? 0) > 1)
    || (settlementKey && (settlementMultiplicity.get(settlementKey) ?? 0) > 1)
  )
}

function groupCandidates(
  candidates: MatchCandidate[],
  keyFor: (candidate: MatchCandidate) => string
): Map<string, MatchCandidate[]> {
  const grouped = new Map<string, MatchCandidate[]>()
  for (const candidate of candidates) {
    const key = keyFor(candidate)
    const bucket = grouped.get(key) ?? []
    bucket.push(candidate)
    grouped.set(key, bucket)
  }
  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => b.score - a.score || a.settlement.id.localeCompare(b.settlement.id))
  }
  return grouped
}

function candidateReasons(
  candidate: MatchCandidate,
  mutualBest: boolean,
  posMargin: number,
  settlementMargin: number
): string[] {
  const reasons: string[] = []
  if (candidate.duplicateConflict) reasons.push('Duplicate canonical identity detected')
  if (!mutualBest) reasons.push('Not reciprocal best candidate')
  if (Math.min(posMargin, settlementMargin) < MATCH_CONFIG.minimumMargin) reasons.push('Confidence margin is too small')
  if (candidate.signals.amount < MATCH_CONFIG.minimumAutoSignals.amount) reasons.push('Fee-adjusted amount evidence is weak')
  if (candidate.signals.time < MATCH_CONFIG.minimumAutoSignals.time) reasons.push('Corrected-time evidence is weak')
  if (candidate.signals.reference < MATCH_CONFIG.minimumAutoSignals.reference) reasons.push('Reference evidence is approximate')
  return reasons
}
