import { Check, Link2, X } from 'lucide-react'
import type { AuditEntry } from './audit'

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <article className="panel">
      <div className="panel__head">
        <div>
          <span className="eyebrow">Reviewer audit</span>
          <h3>Decision timeline</h3>
        </div>
        <span className="badge">{entries.length} action{entries.length === 1 ? '' : 's'}</span>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <strong>Clean automatic baseline</strong>
          <span>Accept, reject, or manually pair a record to create an auditable reviewer trail.</span>
        </div>
      ) : (
        <div className="audit-list">
          {entries.slice(0, 8).map((entry) => (
            <div className="audit-entry" key={entry.id}>
              <span className={`audit-icon audit-icon--${entry.action.toLowerCase()}`}>{iconFor(entry.action)}</span>
              <div>
                <strong>{labelFor(entry.action)}</strong>
                <span>{entry.pair.posId} ↔ {entry.pair.settlementId}</span>
              </div>
              <time dateTime={entry.createdAt}>{formatTime(entry.createdAt)}</time>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function iconFor(action: AuditEntry['action']) {
  if (action === 'ACCEPT') return <Check size={13} />
  if (action === 'REJECT') return <X size={13} />
  return <Link2 size={13} />
}

function labelFor(action: AuditEntry['action']): string {
  if (action === 'ACCEPT') return 'Reviewer accepted candidate'
  if (action === 'REJECT') return 'Reviewer rejected candidate'
  return 'Reviewer manual override'
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'saved'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
