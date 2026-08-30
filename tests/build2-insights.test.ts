import { describe, expect, it } from 'vitest'
import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { buildEndOfDaySummary, buildExceptionBuckets, buildFinancialSnapshot } from '@/domain/reconciliation/insights'
import { reconcile } from '@/domain/reconciliation/reconcile'
import { fixtureSchema } from '@/schemas/reconciliation'

const fixture = fixtureSchema.parse(fixtureRaw)

describe('Build 2 competition insights', () => {
  it('builds consistent financial and exception summaries from API truth', () => {
    const selected = fixture.cases.find((item) => item.case_id === 'PUB-01')
    expect(selected).toBeDefined()
    if (!selected) return

    const result = reconcile(selected, {
      caseId: selected.case_id,
      decisions: { accepted: [], rejected: [], manual: [] }
    })
    const snapshot = buildFinancialSnapshot(result)
    const exceptions = buildExceptionBuckets(result)
    const summary = buildEndOfDaySummary(result)

    expect(result.build).toBe('b2-competition')
    expect(snapshot.autoMatchedCount).toBe(result.matched.filter((match) => match.type === 'AUTO').length)
    expect(snapshot.unresolvedPosValue).toBe(result.metrics.reviewPosValue + result.metrics.unmatchedPosValue)
    expect(snapshot.resolutionRate).toBeCloseTo(result.metrics.matchedCount / result.metrics.posCount)
    expect(exceptions.reduce((sum, bucket) => sum + bucket.count, 0)).toBeGreaterThanOrEqual(result.review.length)
    expect(summary).toContain('PUB-01')
    expect(summary).toContain(`${result.metrics.matchedCount}/${result.metrics.posCount}`)
  })

  it('produces finite competition insights for every organizer case', () => {
    for (const selected of fixture.cases) {
      const result = reconcile(selected, {
        caseId: selected.case_id,
        decisions: { accepted: [], rejected: [], manual: [] }
      })
      const snapshot = buildFinancialSnapshot(result)
      expect(Number.isFinite(snapshot.resolutionRate)).toBe(true)
      expect(snapshot.unresolvedPosValue).toBeGreaterThanOrEqual(0)
      expect(buildEndOfDaySummary(result)).toContain(selected.case_id)
    }
  })
})
