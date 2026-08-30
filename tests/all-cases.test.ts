import { describe, expect, it } from 'vitest'
import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { reconcile } from '@/domain/reconciliation/reconcile'
import { fixtureSchema } from '@/schemas/reconciliation'

const fixture = fixtureSchema.parse(fixtureRaw)

describe('all organizer public cases', () => {
  it('reconciles every case without double-use and keeps record partitions consistent', () => {
    for (const item of fixture.cases) {
      const result = reconcile(item, {
        caseId: item.case_id,
        decisions: { accepted: [], rejected: [], manual: [] }
      })
      const matchedPos = result.matched.map((match) => match.pos.id)
      const matchedSettlement = result.matched.map((match) => match.settlement.id)

      expect(result.fingerprint.seedCount, item.case_id).toBeGreaterThan(60)
      expect(result.matched.length, item.case_id).toBeGreaterThan(60)
      expect(new Set(matchedPos).size, item.case_id).toBe(matchedPos.length)
      expect(new Set(matchedSettlement).size, item.case_id).toBe(matchedSettlement.length)
      expect(
        result.metrics.matchedCount + result.metrics.reviewPosCount + result.metrics.unmatchedPosCount,
        item.case_id
      ).toBe(result.metrics.posCount)
      expect(
        result.metrics.matchedCount + result.metrics.reviewSettlementCount + result.metrics.unmatchedSettlementCount,
        item.case_id
      ).toBe(result.metrics.settlementCount)
    }
  })
})
