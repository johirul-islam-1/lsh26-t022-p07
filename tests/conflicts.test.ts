import { describe, expect, it } from 'vitest'
import { hasCompetingCandidate } from '@/domain/reconciliation/conflicts'

describe('conflict seam', () => {
  it('detects a repeated counterpart id', () => {
    expect(hasCompetingCandidate(['STL-1', 'STL-1'])).toBe(true)
    expect(hasCompetingCandidate(['STL-1', 'STL-2'])).toBe(false)
  })
})
