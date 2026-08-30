import { describe, expect, it } from 'vitest'
import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { inferFingerprint, timestampDiffMinutes } from '@/domain/reconciliation/fingerprint'
import { fixtureSchema } from '@/schemas/reconciliation'

const fixture = fixtureSchema.parse(fixtureRaw)

describe('system fingerprint', () => {
  it('learns the dominant fee and clock shift from organizer seed pairs', () => {
    const pub01 = fixture.cases.find((item) => item.case_id === 'PUB-01')
    expect(pub01).toBeDefined()
    const { fingerprint } = inferFingerprint(pub01!)
    expect(fingerprint.seedCount).toBeGreaterThan(80)
    expect(fingerprint.settlementFee).toBeCloseTo(0.03, 3)
    expect(fingerprint.timeOffsetMinutes).toBe(420)
    expect(fingerprint.feeSupport).toBeGreaterThan(0.9)
    expect(fingerprint.timeSupport).toBeGreaterThan(0.9)
    expect(fingerprint.confidence).toBe('HIGH')
  })

  it('handles midnight crossing as a positive elapsed offset', () => {
    expect(timestampDiffMinutes('2026-08-28T21:00:00', '2026-08-29T04:00:00')).toBe(420)
  })
})
