import type { CandidateSignal } from './types'

export function weightedSignalScore(signals: CandidateSignal): number {
  return signals.reference * 0.45 + signals.amount * 0.35 + signals.time * 0.2
}
