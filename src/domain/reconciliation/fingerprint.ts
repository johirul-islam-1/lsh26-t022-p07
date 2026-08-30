import type { Fingerprint, ReferenceStyle } from './types'

export function buildSkeletonFingerprint(referenceStyle: ReferenceStyle, duplicateConflicts: number): Fingerprint {
  return {
    referenceStyle,
    settlementFee: null,
    feeSupport: 0,
    timeOffsetMinutes: null,
    timeSupport: 0,
    duplicateConflicts,
    confidence: 'LOW'
  }
}
