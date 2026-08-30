import { formatBdt } from '@/lib/format'

export function SummaryCards({ metrics }: { metrics: { posCount: number; settlementCount: number; posTotal: number; settlementTotal: number } }) {
  return (
    <section className="metrics" aria-label="Case summary">
      <Metric label="POS rows" value={String(metrics.posCount)} hint="source report" />
      <Metric label="Settlement rows" value={String(metrics.settlementCount)} hint="processor report" />
      <Metric label="POS total" value={formatBdt(metrics.posTotal)} hint="integer-poisha total" />
      <Metric label="Settlement total" value={formatBdt(metrics.settlementTotal)} hint="integer-poisha total" />
    </section>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>
}
