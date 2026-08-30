import type { PairDecision } from '@/schemas/reconciliation'
import type { ReviewItem } from '@/domain/reconciliation/types'
import { ReviewCard } from './ReviewCard'

export function ReviewQueue({ items, busy, onAccept, onReject }: {
  items: ReviewItem[]
  busy: boolean
  onAccept: (pair: PairDecision) => void
  onReject: (pair: PairDecision) => void
}) {
  if (items.length === 0) return <div className="empty-state"><strong>Review queue clear</strong><span>No ambiguous or outlier candidate currently needs a human decision.</span></div>
  return <div className="review-grid">{items.map((item) => <ReviewCard key={item.id} item={item} busy={busy} onAccept={onAccept} onReject={onReject} />)}</div>
}
