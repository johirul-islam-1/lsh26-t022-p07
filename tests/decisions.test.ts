import { describe, expect, it } from 'vitest'
import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { reconcile } from '@/domain/reconciliation/reconcile'
import { fixtureSchema } from '@/schemas/reconciliation'

const fixture = fixtureSchema.parse(fixtureRaw)
const pub01 = fixture.cases.find((item) => item.case_id === 'PUB-01')!

describe('human decisions', () => {
  it('accepts a review candidate and recomputes the result', () => {
    const initial = reconcile(pub01, { caseId: 'PUB-01', decisions: { accepted: [], rejected: [], manual: [] } })
    const candidate = initial.review[0]?.candidates[0]
    expect(candidate).toBeDefined()
    const pair = { posId: candidate!.pos.id, settlementId: candidate!.settlement.id }
    const after = reconcile(pub01, { caseId: 'PUB-01', decisions: { accepted: [pair], rejected: [], manual: [] } })
    expect(after.matched.some((match) => match.type === 'ACCEPTED' && match.pos.id === pair.posId && match.settlement.id === pair.settlementId)).toBe(true)
  })

  it('rejects a candidate so the exact pair cannot return', () => {
    const initial = reconcile(pub01, { caseId: 'PUB-01', decisions: { accepted: [], rejected: [], manual: [] } })
    const candidate = initial.review[0]?.candidates[0]
    expect(candidate).toBeDefined()
    const pair = { posId: candidate!.pos.id, settlementId: candidate!.settlement.id }
    const after = reconcile(pub01, { caseId: 'PUB-01', decisions: { accepted: [], rejected: [pair], manual: [] } })
    const returnedPair = after.review.flatMap((item) => item.candidates).some((item) => item.pos.id === pair.posId && item.settlement.id === pair.settlementId)
    expect(returnedPair).toBe(false)
  })

  it('manual-pairs unmatched records and prevents double-use', () => {
    const initial = reconcile(pub01, { caseId: 'PUB-01', decisions: { accepted: [], rejected: [], manual: [] } })
    const pos = initial.unmatched.pos[0]
    const settlement = initial.unmatched.settlement[0]
    expect(pos).toBeDefined()
    expect(settlement).toBeDefined()
    const pair = { posId: pos!.id, settlementId: settlement!.id }
    const after = reconcile(pub01, { caseId: 'PUB-01', decisions: { accepted: [], rejected: [], manual: [pair, pair] } })
    expect(after.matched.filter((match) => match.type === 'MANUAL' && match.pos.id === pair.posId).length).toBe(1)
    expect(after.decisionWarnings.length).toBeGreaterThan(0)
  })
})
