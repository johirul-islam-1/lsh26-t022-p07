import type { ReconciliationCase, ReconcileRequest } from '@/schemas/reconciliation'
import { buildCandidates, isAutoSafe } from './candidates'
import { MATCH_CONFIG } from './config'
import { classifyReviewReason } from './conflicts'
import { applyForcedDecisions, pairKey } from './decisions'
import { inferFingerprint } from './fingerprint'
import { buildMetrics } from './metrics'
import { parseBdtToPoisha } from './money'
import { profileCase } from './profiler'
import type { Match, MatchCandidate, ReconciliationResult, ReviewItem } from './types'

export function reconcile(input: ReconciliationCase, request: ReconcileRequest): ReconciliationResult {
  const profile = profileCase(input)
  const { fingerprint } = inferFingerprint(input)
  const forced = applyForcedDecisions(input.pos, input.settlement, request.decisions.accepted, request.decisions.manual, fingerprint)
  const rejectedPairs = new Set(request.decisions.rejected.map(pairKey))

  const availablePos = input.pos.filter((row) => !forced.usedPos.has(row.id))
  const availableSettlement = input.settlement.filter((row) => !forced.usedSettlement.has(row.id))
  const candidates = buildCandidates(input, fingerprint, availablePos, availableSettlement, rejectedPairs)
  const autoMatches = chooseAutoMatches(candidates)
  const matched = [...forced.matches, ...autoMatches]
  const usedPos = new Set(matched.map((match) => match.pos.id))
  const usedSettlement = new Set(matched.map((match) => match.settlement.id))
  const reviewCandidates = candidates.filter((candidate) =>
    !usedPos.has(candidate.pos.id)
    && !usedSettlement.has(candidate.settlement.id)
    && candidate.score >= MATCH_CONFIG.reviewThreshold
  )
  const review = buildReviewItems(reviewCandidates)
  const reviewPosIds = new Set(review.map((item) => item.pos.id))
  const reviewSettlementIds = new Set(review.flatMap((item) => item.candidates.map((candidate) => candidate.settlement.id)))
  const unmatched = {
    pos: input.pos.filter((row) => !usedPos.has(row.id) && !reviewPosIds.has(row.id)),
    settlement: input.settlement.filter((row) => !usedSettlement.has(row.id) && !reviewSettlementIds.has(row.id))
  }

  return {
    build: 'b2-competition',
    case: { id: input.case_id, today: input.today },
    profile,
    fingerprint,
    matched,
    review,
    unmatched,
    source: { pos: input.pos, settlement: input.settlement },
    metrics: buildMetrics(input, matched, review, unmatched),
    decisions: request.decisions,
    decisionWarnings: forced.warnings
  }
}

function chooseAutoMatches(candidates: MatchCandidate[]): Match[] {
  const matches: Match[] = []
  const usedPos = new Set<string>()
  const usedSettlement = new Set<string>()
  const ordered = candidates.filter(isAutoSafe).sort((a, b) => b.score - a.score)

  for (const candidate of ordered) {
    if (usedPos.has(candidate.pos.id) || usedSettlement.has(candidate.settlement.id)) continue
    matches.push(toAutoMatch(candidate))
    usedPos.add(candidate.pos.id)
    usedSettlement.add(candidate.settlement.id)
  }
  return matches
}

function toAutoMatch(candidate: MatchCandidate): Match {
  return {
    pos: candidate.pos,
    settlement: candidate.settlement,
    confidence: candidate.score,
    type: 'AUTO',
    signals: candidate.signals,
    expectedSettlementAmount: candidate.expectedSettlementAmount,
    expectedSettlementTime: candidate.expectedSettlementTime,
    amountDifference: candidate.amountDifference,
    timeDifferenceMinutes: candidate.timeDifferenceMinutes,
    safety: {
      mutualBest: candidate.mutualBest,
      margin: Math.min(candidate.posMargin, candidate.settlementMargin),
      uniqueCandidate: Math.min(candidate.posMargin, candidate.settlementMargin) >= MATCH_CONFIG.minimumMargin,
      noDuplicateConflict: !candidate.duplicateConflict
    },
    explanation: [
      `Reference evidence ${(candidate.signals.reference * 100).toFixed(0)}%.`,
      `Fee-adjusted amount evidence ${(candidate.signals.amount * 100).toFixed(0)}%.`,
      `Corrected-time evidence ${(candidate.signals.time * 100).toFixed(0)}%.`,
      'Passed reciprocal-best, confidence-margin, duplicate and record-reuse safety checks.'
    ]
  }
}

function buildReviewItems(candidates: MatchCandidate[]): ReviewItem[] {
  const byPos = new Map<string, MatchCandidate[]>()
  for (const candidate of candidates) {
    const bucket = byPos.get(candidate.pos.id) ?? []
    bucket.push(candidate)
    byPos.set(candidate.pos.id, bucket)
  }

  const items: ReviewItem[] = []
  for (const [posId, bucket] of byPos) {
    bucket.sort((a, b) => b.score - a.score)
    const visible = bucket.slice(0, MATCH_CONFIG.maxReviewCandidates)
    const top = visible[0]
    if (!top) continue
    items.push({
      id: `review:${posId}`,
      pos: top.pos,
      reason: classifyReviewReason(top, visible),
      candidates: visible,
      priority: reviewPriority(top, visible),
      whyNotAuto: top.reasons.length > 0 ? top.reasons : ['Score did not clear the conservative automatic threshold.']
    })
  }

  return items.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)
    || parseBdtToPoisha(b.pos.amount_bdt) - parseBdtToPoisha(a.pos.amount_bdt))
}

function reviewPriority(top: MatchCandidate, candidates: MatchCandidate[]): ReviewItem['priority'] {
  const nearTie = candidates.length > 1 && Math.abs(top.score - (candidates[1]?.score ?? 0)) < MATCH_CONFIG.minimumMargin
  if (top.duplicateConflict || nearTie || parseBdtToPoisha(top.pos.amount_bdt) >= 200_000) return 'HIGH'
  if (top.score >= 0.8) return 'MEDIUM'
  return 'LOW'
}

function priorityRank(priority: ReviewItem['priority']): number {
  return priority === 'HIGH' ? 0 : priority === 'MEDIUM' ? 1 : 2
}
