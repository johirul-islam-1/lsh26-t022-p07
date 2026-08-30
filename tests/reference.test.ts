import { describe, expect, it } from 'vitest'
import { canonicalizeReference } from '@/domain/reconciliation/reference'

describe('reference canonicalization', () => {
  it('maps documented semantic variants to the same identity', () => {
    const refs = ['INV-2026-069080', 'inv_2026_69080', '069080/2026/INV', '2026069080']
    expect(refs.map((ref) => canonicalizeReference(ref)?.key)).toEqual([
      '2026:69080', '2026:69080', '2026:69080', '2026:69080'
    ])
  })
})
