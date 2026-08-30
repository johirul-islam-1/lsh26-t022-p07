import type { PairDecision, Transaction } from '@/schemas/reconciliation'

export type Money = number // integer poisha
export type ReferenceStyle = 'digits' | 'lowercase' | 'suffixed' | 'mixed'
export type MatchType = 'AUTO' | 'ACCEPTED' | 'MANUAL'
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
  pos: Transaction
  settlement: Transaction
  score: number
  signals: CandidateSignal
  expectedSettlementAmount: Money | null
  expectedSettlementTime: string | null
  amountDifference: Money | null
  timeDifferenceMinutes: number | null
  posMargin: number
  settlementMargin: number
  mutualBest: boolean
  duplicateConflict: boolean
  reasons: string[]
}

export interface MatchSafety {
  mutualBest: boolean
  margin: number
  uniqueCandidate: boolean
  noDuplicateConflict: boolean
}

export interface Match {
  pos: Transaction
  settlement: Transaction
  confidence: number
  type: MatchType
  signals: CandidateSignal
  expectedSettlementAmount: Money | null
  expectedSettlementTime: string | null
  amountDifference: Money | null
  timeDifferenceMinutes: number | null
  safety: MatchSafety
  explanation: string[]
}

export interface ReviewItem {
  id: string
  pos: Transaction
  reason: ReviewReason
  candidates: MatchCandidate[]
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  whyNotAuto: string[]
}

export interface Fingerprint {
  referenceStyle: ReferenceStyle
  settlementFee: number | null
  feeSupport: number
  timeOffsetMinutes: number | null
  timeSupport: number
  seedCount: number
  duplicateConflicts: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface Metrics {
  posCount: number
  settlementCount: number
  matchedCount: number
  reviewCount: number
  reviewPosCount: number
  reviewSettlementCount: number
  unmatchedPosCount: number
  unmatchedSettlementCount: number
  matchedPosValue: Money
  matchedSettlementValue: Money
  reviewPosValue: Money
  reviewSettlementValue: Money
  unmatchedPosValue: Money
  unmatchedSettlementValue: Money
  posTotal: Money
  settlementTotal: Money
}

export interface ReconciliationResult {
  build: 'b1-functional-mvp'
  case: { id: string; today: string }
  profile: {
    referenceStyle: ReferenceStyle
    afterMidnightCount: number
    duplicatePosCount: number
    duplicateSettlementCount: number
  }
  fingerprint: Fingerprint
  matched: Match[]
  review: ReviewItem[]
  unmatched: { pos: Transaction[]; settlement: Transaction[] }
  source: { pos: Transaction[]; settlement: Transaction[] }
  metrics: Metrics
  decisions: {
    accepted: PairDecision[]
    rejected: PairDecision[]
    manual: PairDecision[]
  }
  decisionWarnings: string[]
}
