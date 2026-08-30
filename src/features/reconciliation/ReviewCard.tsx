import { AlertTriangle, Check, X } from 'lucide-react'
import type { PairDecision } from '@/schemas/reconciliation'
import type { ReviewItem } from '@/domain/reconciliation/types'
import { formatBdt } from '@/lib/format'
import { REVIEW_REASON_LABELS } from '@/domain/reconciliation/reasons'

export function ReviewCard({ item, busy, onAccept, onReject }: {
  item: ReviewItem
  busy: boolean
  onAccept: (pair: PairDecision) => void
  onReject: (pair: PairDecision) => void
}) {
  const candidate = item.candidates[0]
  if (!candidate) return null
  const pair = { posId: candidate.pos.id, settlementId: candidate.settlement.id }
  return (
    <article className="review-card">
      <div className="review-card__head">
        <span className={`priority priority--${item.priority.toLowerCase()}`}>{item.priority} PRIORITY</span>
        <span className="review-reason"><AlertTriangle size={14} /> {REVIEW_REASON_LABELS[item.reason]}</span>
        <strong>{Math.round(candidate.score * 100)}%</strong>
      </div>
      <code className="reason-code">{item.reason}</code>
      <div className="pair-grid">
        <div><span>POS</span><strong>{candidate.pos.id}</strong><small>{candidate.pos.reference}</small><b>{formatBdt(Number(candidate.pos.amount_bdt) * 100)}</b><small>{candidate.pos.time.replace('T', ' ')}</small></div>
        <div><span>Candidate settlement</span><strong>{candidate.settlement.id}</strong><small>{candidate.settlement.reference}</small><b>{formatBdt(Number(candidate.settlement.amount_bdt) * 100)}</b><small>{candidate.settlement.time.replace('T', ' ')}</small></div>
      </div>
      <div className="mini-signals">
        <span>Reference {Math.round(candidate.signals.reference * 100)}%</span>
        <span>Amount {Math.round(candidate.signals.amount * 100)}%</span>
        <span>Time {Math.round(candidate.signals.time * 100)}%</span>
      </div>
      <div className="why-list">
        <strong>Why not auto-matched?</strong>
        {item.whyNotAuto.map((reason) => <span key={reason}>• {reason}</span>)}
      </div>
      {item.candidates.length > 1 && <small className="alternate-note">{item.candidates.length - 1} alternate candidate(s) also remain plausible.</small>}
      <div className="review-actions">
        <button className="button button--good" onClick={() => onAccept(pair)} disabled={busy}><Check size={15} /> Accept pair</button>
        <button className="button button--danger" onClick={() => onReject(pair)} disabled={busy}><X size={15} /> Reject</button>
      </div>
    </article>
  )
}
