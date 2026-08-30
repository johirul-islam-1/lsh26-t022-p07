import { MATCH_CONFIG } from './config'
import { epochMsToTimestamp, timestampToEpochMs } from './fingerprint'
import { parseBdtToPoisha } from './money'
import { referenceEvidence } from './reference'
import type { CandidateSignal, Fingerprint, Money } from './types'
import type { Transaction } from '@/schemas/reconciliation'

export interface SignalEvidence {
  signals: CandidateSignal
  expectedSettlementAmount: Money | null
  expectedSettlementTime: string | null
  amountDifference: Money | null
  timeDifferenceMinutes: number | null
}

export function evaluateSignals(pos: Transaction, settlement: Transaction, fingerprint: Fingerprint): SignalEvidence {
  const expectedSettlementAmount = expectedAmount(pos, fingerprint)
  const actualSettlementAmount = parseBdtToPoisha(settlement.amount_bdt)
  const amountDifference = expectedSettlementAmount === null ? null : actualSettlementAmount - expectedSettlementAmount
  const expectedTimeMs = fingerprint.timeOffsetMinutes === null
    ? null
    : timestampToEpochMs(pos.time) + fingerprint.timeOffsetMinutes * 60_000
  const actualTimeMs = timestampToEpochMs(settlement.time)
  const timeDifferenceMinutes = expectedTimeMs === null ? null : Math.abs(actualTimeMs - expectedTimeMs) / 60_000

  return {
    signals: {
      reference: referenceEvidence(pos.reference, settlement.reference),
      amount: amountSignal(expectedSettlementAmount, actualSettlementAmount),
      time: timeSignal(timeDifferenceMinutes)
    },
    expectedSettlementAmount,
    expectedSettlementTime: expectedTimeMs === null ? null : epochMsToTimestamp(expectedTimeMs),
    amountDifference,
    timeDifferenceMinutes
  }
}

export function weightedSignalScore(signals: CandidateSignal): number {
  return signals.reference * MATCH_CONFIG.weights.reference
    + signals.amount * MATCH_CONFIG.weights.amount
    + signals.time * MATCH_CONFIG.weights.time
}

function expectedAmount(pos: Transaction, fingerprint: Fingerprint): Money | null {
  if (fingerprint.settlementFee === null) return null
  const ratio = 1 - fingerprint.settlementFee
  return Math.round(parseBdtToPoisha(pos.amount_bdt) * ratio)
}

function amountSignal(expected: Money | null, actual: Money): number {
  if (expected === null) return 0
  const difference = Math.abs(actual - expected)
  const relative = difference / Math.max(1, expected)
  if (difference <= 1) return 1
  if (relative <= 0.0005) return 0.96
  if (relative <= 0.002) return 0.86
  if (relative <= 0.01) return 0.55
  if (relative <= 0.03) return 0.25
  return 0
}

function timeSignal(differenceMinutes: number | null): number {
  if (differenceMinutes === null) return 0
  if (differenceMinutes <= 1) return 1
  if (differenceMinutes <= 5) return 0.95
  if (differenceMinutes <= 15) return 0.82
  if (differenceMinutes <= 30) return 0.65
  if (differenceMinutes <= 60) return 0.4
  if (differenceMinutes <= 180) return 0.15
  return 0
}
