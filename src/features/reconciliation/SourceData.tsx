import type { Transaction } from '@/schemas/reconciliation'
import { formatBdt } from '@/lib/format'

export function SourceData({ source }: { source: { pos: Transaction[]; settlement: Transaction[] } }) {
  return (
    <div className="source-grid">
      <SourceTable title="POS report" rows={source.pos} />
      <SourceTable title="Settlement report" rows={source.settlement} />
    </div>
  )
}

function SourceTable({ title, rows }: { title: string; rows: Transaction[] }) {
  return (
    <section className="source-panel">
      <div className="source-panel__head"><strong>{title}</strong><span>{rows.length} records</span></div>
      <div className="source-scroll">
        <table className="data-table data-table--compact">
          <thead><tr><th>ID</th><th>Reference</th><th>Amount</th><th>Time</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.reference}</td><td>{formatBdt(Number(row.amount_bdt) * 100)}</td><td>{row.time.slice(11, 16)}{row.time.slice(0, 10) !== rows[0]?.time.slice(0, 10) ? ' +1d' : ''}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}
