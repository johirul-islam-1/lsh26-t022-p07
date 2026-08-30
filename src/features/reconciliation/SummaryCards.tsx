import type { Metrics } from '@/domain/reconciliation/types'
import { formatBdt } from '@/lib/format'

export function SummaryCards({ metrics }: { metrics: Metrics }) {
  const resolution = metrics.posCount === 0 ? 0 : Math.round((metrics.matchedCount / metrics.posCount) * 100)
  return (
    <section className="metrics metrics--five" aria-label="Reconciliation summary">
      <Metric label="Auto / decided matches" value={String(metrics.matchedCount)} hint={`${resolution}% of POS rows resolved`} tone="good" />
      <Metric label="Needs review" value={String(metrics.reviewCount)} hint={`${formatBdt(metrics.reviewPosValue)} POS value`} tone="warn" />
      <Metric label="Unmatched POS" value={String(metrics.unmatchedPosCount)} hint={formatBdt(metrics.unmatchedPosValue)} />
      <Metric label="Unmatched settlement" value={String(metrics.unmatchedSettlementCount)} hint={formatBdt(metrics.unmatchedSettlementValue)} />
      <Metric label="Source scale" value={`${metrics.posCount} ↔ ${metrics.settlementCount}`} hint={`${formatBdt(metrics.posTotal)} gross POS`} />
    </section>
  )
}

function Metric({ label, value, hint, tone = 'neutral' }: { label: string; value: string; hint: string; tone?: 'neutral' | 'good' | 'warn' }) {
  return <article className={`metric metric--${tone}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>
}
