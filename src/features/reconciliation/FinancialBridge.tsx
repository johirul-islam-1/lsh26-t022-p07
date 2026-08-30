'use client'

import { useState } from 'react'
import { ClipboardCheck, Landmark, ShieldAlert, WalletCards } from 'lucide-react'
import type { ReconciliationResult } from '@/domain/reconciliation/types'
import { buildEndOfDaySummary, buildExceptionBuckets, buildFinancialSnapshot } from '@/domain/reconciliation/insights'
import { REVIEW_REASON_LABELS } from '@/domain/reconciliation/reasons'
import { formatBdt } from '@/lib/format'

export function FinancialBridge({ result }: { result: ReconciliationResult }) {
  const [copied, setCopied] = useState(false)
  const snapshot = buildFinancialSnapshot(result)
  const exceptions = buildExceptionBuckets(result)
  const summary = buildEndOfDaySummary(result)

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="panel financial-panel">
      <div className="panel__head">
        <div>
          <span className="eyebrow">Financial bridge</span>
          <h3>What reconciliation means at close</h3>
        </div>
        <span className="badge badge--good"><Landmark size={13} /> {Math.round(snapshot.resolutionRate * 100)}% resolved</span>
      </div>

      <div className="financial-grid">
        <FinancialFact icon={<WalletCards size={15} />} label="Matched POS gross" value={formatBdt(snapshot.matchedGrossValue)} />
        <FinancialFact icon={<Landmark size={15} />} label="Matched settlement net" value={formatBdt(snapshot.matchedSettlementValue)} />
        <FinancialFact icon={<ShieldAlert size={15} />} label="POS value still unresolved" value={formatBdt(snapshot.unresolvedPosValue)} />
      </div>

      <div className="resolution-strip">
        <span><b>{snapshot.autoMatchedCount}</b> auto-cleared</span>
        <span><b>{snapshot.reviewerAcceptedCount}</b> reviewer-accepted</span>
        <span><b>{snapshot.manualMatchedCount}</b> manual override</span>
        <span><b>{snapshot.highPriorityReviewCount}</b> high-priority review</span>
      </div>

      <div className="financial-detail">
        <span>Observed matched gross→net gap <b>{formatBdt(snapshot.matchedGrossNetGap)}</b></span>
        <span>Learned-rule fee estimate <b>{snapshot.estimatedLearnedFeeValue === null ? '—' : formatBdt(snapshot.estimatedLearnedFeeValue)}</b></span>
      </div>

      <div className="exception-summary">
        <strong>Exception codes</strong>
        <div>
          {exceptions.length === 0
            ? <span className="exception-chip exception-chip--clear">No open exceptions</span>
            : exceptions.slice(0, 5).map((bucket) => (
              <span className="exception-chip" key={bucket.code} title={REVIEW_REASON_LABELS[bucket.code]}>
                {bucket.code} · {bucket.count}
              </span>
            ))}
        </div>
      </div>

      <div className="eod-summary">
        <div><span className="eyebrow">End-of-day summary</span><p>{summary}</p></div>
        <button className="button button--ghost" type="button" onClick={copySummary}>
          <ClipboardCheck size={14} /> {copied ? 'Copied' : 'Copy summary'}
        </button>
      </div>
    </article>
  )
}

function FinancialFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="financial-fact"><span>{icon}{label}</span><strong>{value}</strong></div>
}
