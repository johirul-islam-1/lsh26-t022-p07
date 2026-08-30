import type { ReconciliationCase, Transaction } from '@/schemas/reconciliation'
import { MATCH_CONFIG } from './config'
import { parseBdtToPoisha } from './money'
import { detectReferenceStyle, canonicalizeReference } from './reference'
import type { Fingerprint } from './types'

export interface SeedPair { pos: Transaction; settlement: Transaction }

export function inferFingerprint(input: ReconciliationCase): { fingerprint: Fingerprint; seeds: SeedPair[] } {
  const posByKey = groupByCanonicalKey(input.pos)
  const settlementByKey = groupByCanonicalKey(input.settlement)
  const seeds: SeedPair[] = []

  for (const [key, posRows] of posByKey) {
    const settlementRows = settlementByKey.get(key)
    if (posRows.length === 1 && settlementRows?.length === 1) {
      seeds.push({ pos: posRows[0], settlement: settlementRows[0] })
    }
  }

  const ratios = seeds.map(({ pos, settlement }) => {
    const gross = parseBdtToPoisha(pos.amount_bdt)
    return gross === 0 ? 1 : parseBdtToPoisha(settlement.amount_bdt) / gross
  })
  const offsets = seeds.map(({ pos, settlement }) => timestampDiffMinutes(pos.time, settlement.time))
  const settlementRatio = median(ratios)
  const timeOffsetMinutes = median(offsets)
  const feeSupport = settlementRatio === null || ratios.length === 0
    ? 0
    : ratios.filter((ratio) => Math.abs(ratio - settlementRatio) <= MATCH_CONFIG.feeSupportTolerance).length / ratios.length
  const timeSupport = timeOffsetMinutes === null || offsets.length === 0
    ? 0
    : offsets.filter((offset) => Math.abs(offset - timeOffsetMinutes) <= MATCH_CONFIG.timeSupportToleranceMinutes).length / offsets.length
  const duplicateConflicts = countDuplicateCanonicalKeys(posByKey) + countDuplicateCanonicalKeys(settlementByKey)

  return {
    seeds,
    fingerprint: {
      referenceStyle: detectReferenceStyle(input.settlement.map((row) => row.reference)),
      settlementFee: settlementRatio === null ? null : Math.max(0, 1 - settlementRatio),
      feeSupport,
      timeOffsetMinutes,
      timeSupport,
      seedCount: seeds.length,
      duplicateConflicts,
      confidence: confidenceFor(seeds.length, feeSupport, timeSupport)
    }
  }
}

export function timestampToEpochMs(value: string): number {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/)
  if (!match) throw new Error(`Invalid timestamp: ${value}`)
  const [, year, month, day, hour, minute, second] = match
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
}

export function epochMsToTimestamp(value: number): string {
  return new Date(value).toISOString().slice(0, 19)
}

export function timestampDiffMinutes(from: string, to: string): number {
  return (timestampToEpochMs(to) - timestampToEpochMs(from)) / 60_000
}

function groupByCanonicalKey(rows: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>()
  for (const row of rows) {
    const key = canonicalizeReference(row.reference)?.key
    if (!key) continue
    const bucket = grouped.get(key) ?? []
    bucket.push(row)
    grouped.set(key, bucket)
  }
  return grouped
}

function countDuplicateCanonicalKeys(grouped: Map<string, Transaction[]>): number {
  return [...grouped.values()].filter((rows) => rows.length > 1).length
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : sorted[middle] ?? null
}

function confidenceFor(seedCount: number, feeSupport: number, timeSupport: number): Fingerprint['confidence'] {
  if (seedCount >= 10 && feeSupport >= 0.8 && timeSupport >= 0.8) return 'HIGH'
  if (seedCount >= 5 && feeSupport >= 0.6 && timeSupport >= 0.6) return 'MEDIUM'
  return 'LOW'
}
