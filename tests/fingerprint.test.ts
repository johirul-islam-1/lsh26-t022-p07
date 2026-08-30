import { describe, expect, it } from 'vitest'
import { buildSkeletonFingerprint } from '@/domain/reconciliation/fingerprint'

describe('Build 0 fingerprint seam', () => {
  it('does not invent learned fee/time patterns before Build 1', () => {
    const fingerprint = buildSkeletonFingerprint('lowercase', 2)
    expect(fingerprint.settlementFee).toBeNull()
    expect(fingerprint.timeOffsetMinutes).toBeNull()
    expect(fingerprint.confidence).toBe('LOW')
  })
})
