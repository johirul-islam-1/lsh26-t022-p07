import { describe, expect, it } from 'vitest'
import { weightedSignalScore } from '@/domain/reconciliation/signals'
describe('scoring config', () => { it('uses the locked 45/35/20 weighting', () => { expect(weightedSignalScore({ reference: 1, amount: 1, time: 1 })).toBeCloseTo(1) }) })
