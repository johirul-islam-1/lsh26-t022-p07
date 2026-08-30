export const MATCH_CONFIG = {
  weights: { reference: 0.45, amount: 0.35, time: 0.2 },
  candidateFloor: 0.45,
  autoThreshold: 0.88,
  reviewThreshold: 0.62,
  minimumMargin: 0.08,
  minimumAutoSignals: {
    reference: 0.8,
    amount: 0.8,
    time: 0.6
  },
  feeSupportTolerance: 0.001,
  timeSupportToleranceMinutes: 5,
  maxReviewCandidates: 3
} as const
