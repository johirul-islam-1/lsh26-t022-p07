import { describe, expect, it } from 'vitest'
import { parseBdtToPoisha } from '@/domain/reconciliation/money'

describe('money', () => {
  it('converts BDT strings into integer poisha', () => {
    expect(parseBdtToPoisha('1764.40')).toBe(176440)
    expect(parseBdtToPoisha('15.8')).toBe(1580)
  })
})
