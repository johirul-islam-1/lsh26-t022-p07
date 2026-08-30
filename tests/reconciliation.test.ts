import { describe, expect, it } from 'vitest'
import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { reconcile } from '@/domain/reconciliation/reconcile'
import { fixtureSchema } from '@/schemas/reconciliation'

const fixture = fixtureSchema.parse(fixtureRaw)
const pub01 = fixture.cases.find((item) => item.case_id === 'PUB-01')!
const emptyDecisions = { accepted: [], rejected: [], manual: [] }

describe('full reconciliation', () => {
  it('classifies PUB-01 into matched, review and unmatched without record reuse', () => {
    const result = reconcile(pub01, { caseId: 'PUB-01', decisions: emptyDecisions })
    expect(result.build).toBe('b2-competition')
    expect(result.matched.length).toBeGreaterThan(80)
    expect(result.review.length).toBeGreaterThan(0)
    expect(result.unmatched.pos.length).toBeGreaterThan(0)
    expect(result.unmatched.settlement.length).toBeGreaterThan(0)

    const matchedPos = result.matched.map((match) => match.pos.id)
    const matchedSettlement = result.matched.map((match) => match.settlement.id)
    expect(new Set(matchedPos).size).toBe(matchedPos.length)
    expect(new Set(matchedSettlement).size).toBe(matchedSettlement.length)

    expect(result.matched.some((match) => match.pos.id === 'POS-003' || match.pos.id === 'POS-004')).toBe(false)
    expect(result.review.some((item) => item.pos.id === 'POS-003' || item.pos.id === 'POS-004')).toBe(true)
  })

  it('keeps metric partitions consistent with the returned records', () => {
    const result = reconcile(pub01, { caseId: 'PUB-01', decisions: emptyDecisions })
    expect(result.metrics.matchedCount).toBe(result.matched.length)
    expect(result.metrics.reviewCount).toBe(result.review.length)
    expect(result.metrics.unmatchedPosCount).toBe(result.unmatched.pos.length)
    expect(result.metrics.unmatchedSettlementCount).toBe(result.unmatched.settlement.length)
  })
})
