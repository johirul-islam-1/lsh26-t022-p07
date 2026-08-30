import type { Transaction } from '@/schemas/reconciliation'

export type Money = number // integer poisha
export type ReferenceStyle = 'digits' | 'lowercase' | 'suffixed' | 'mixed'
export type MatchType = 'AUTO' | 'MANUAL'
export type ReviewReason =
  | 'DUPLICATE_CONFLICT'
  | 'MULTIPLE_PLAUSIBLE_MATCHES'
  | 'AMOUNT_OUTLIER'
  | 'TIME_OUTLIER'
  | 'MISSING_SETTLEMENT'
  | 'MISSING_POS'
  | 'REFERENCE_PARSE_FAILURE'
  | 'UNEXPLAINED'

export interface CanonicalReference {
  year: number
  invoice: number
  key: string
}

export interface CandidateSignal {
  reference: number
  amount: number
  time: number
}

export interface MatchCandidate {
  posId: string
  settlementId: string
  score: number
  signals: CandidateSignal
  reasons: string[]
}

export interface Match {
  pos: Transaction
  settlement: Transaction
  confidence: number
  type: MatchType
  signals: CandidateSignal
  explanation: string[]
}

export interface ReviewItem {
  pos?: Transaction
  settlement?: Transaction
  reason: ReviewReason
  candidates: MatchCandidate[]
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface Fingerprint {
  referenceStyle: ReferenceStyle
  settlementFee: number | null
  feeSupport: number
  timeOffsetMinutes: number | null
  timeSupport: number
  duplicateConflicts: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface Metrics {
  posCount: number
  settlementCount: number
  matchedCount: number
  reviewCount: number
  unmatchedPosCount: number
  unmatchedSettlementCount: number
  matchedPosValue: Money
  matchedSettlementValue: Money
  unmatchedPosValue: Money
  unmatchedSettlementValue: Money
  posTotal: Money
  settlementTotal: Money
}
