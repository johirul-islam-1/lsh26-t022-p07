import type { ReconciliationCase, ReconcileRequest } from '@/schemas/reconciliation'
import { buildSkeletonFingerprint } from './fingerprint'
import { buildSkeletonMetrics } from './metrics'
import { profileCase } from './profiler'

export function reconcileSkeleton(input: ReconciliationCase, _request: ReconcileRequest) {
  void _request

  const profile = profileCase(input)
  return {
    build: 'b0-skeleton',
    case: { id: input.case_id, today: input.today },
    profile,
    fingerprint: buildSkeletonFingerprint(
      profile.referenceStyle,
      profile.duplicatePosCount + profile.duplicateSettlementCount
    ),
    matched: [],
    review: [],
    unmatched: { pos: input.pos, settlement: input.settlement },
    metrics: buildSkeletonMetrics(input)
  }
}
