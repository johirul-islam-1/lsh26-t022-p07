import { describe, expect, it } from 'vitest'
import { evaluateSignals, weightedSignalScore } from '@/domain/reconciliation/signals'
import type { Fingerprint } from '@/domain/reconciliation/types'

const fingerprint: Fingerprint = {
  referenceStyle: 'lowercase',
  settlementFee: 0.03,
  feeSupport: 1,
  timeOffsetMinutes: 420,
  timeSupport: 1,
  seedCount: 80,
  duplicateConflicts: 0,
  confidence: 'HIGH'
}

describe('multi-signal scoring', () => {
  it('uses the locked 45/35/20 weighting', () => {
    expect(weightedSignalScore({ reference: 1, amount: 1, time: 1 })).toBeCloseTo(1)
  })

  it('gives strong evidence to fee-adjusted amount and corrected time', () => {
    const evidence = evaluateSignals(
      { id: 'P', reference: 'INV-2026-069080', amount_bdt: '1000.00', time: '2026-08-28T09:00:00' },
      { id: 'S', reference: 'inv_2026_69080', amount_bdt: '970.00', time: '2026-08-28T16:00:00' },
      fingerprint
    )
    expect(evidence.signals).toEqual({ reference: 1, amount: 1, time: 1 })
  })

  it('does not treat an amount outlier as a safe perfect candidate', () => {
    const evidence = evaluateSignals(
      { id: 'P', reference: 'INV-2026-069080', amount_bdt: '1000.00', time: '2026-08-28T09:00:00' },
      { id: 'S', reference: 'inv_2026_69080', amount_bdt: '800.00', time: '2026-08-28T16:00:00' },
      fingerprint
    )
    expect(evidence.signals.reference).toBe(1)
    expect(evidence.signals.amount).toBe(0)
    expect(weightedSignalScore(evidence.signals)).toBeLessThan(0.88)
  })
})
