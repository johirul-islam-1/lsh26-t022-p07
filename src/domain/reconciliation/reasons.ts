import type { ReviewReason } from './types'

export const REVIEW_REASON_LABELS: Record<ReviewReason, string> = {
  DUPLICATE_CONFLICT: 'Duplicate conflict',
  MULTIPLE_PLAUSIBLE_MATCHES: 'Multiple plausible matches',
  AMOUNT_OUTLIER: 'Amount outlier',
  TIME_OUTLIER: 'Time outlier',
  MISSING_SETTLEMENT: 'Missing settlement',
  MISSING_POS: 'Missing POS',
  REFERENCE_PARSE_FAILURE: 'Reference parse failure',
  UNEXPLAINED: 'Unexplained'
}
