'use client'

import { useState } from 'react'
import type { Match } from '@/domain/reconciliation/types'
import { formatBdt } from '@/lib/format'
import { MatchEvidence } from './MatchEvidence'

export function MatchedTable({ matches }: { matches: Match[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  if (matches.length === 0) return <Empty title="No matches yet" detail="No pair currently clears the conservative matching envelope." />

  return (
    <div className="stack">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>POS</th><th>Settlement</th><th>Evidence</th><th>Amount Δ</th><th>Time Δ</th><th>Decision</th></tr></thead>
          <tbody>
            {matches.map((match) => {
              const key = `${match.pos.id}::${match.settlement.id}`
              return (
                <tr key={key} onClick={() => setSelected(selected === key ? null : key)} className="clickable-row">
                  <td><strong>{match.pos.id}</strong><small>{match.pos.reference}</small></td>
                  <td><strong>{match.settlement.id}</strong><small>{match.settlement.reference}</small></td>
                  <td>{match.type === 'MANUAL' ? <><strong>—</strong><small>human override</small></> : `${Math.round(match.confidence * 100)}%`}</td>
                  <td>{match.amountDifference === null ? '—' : formatBdt(Math.abs(match.amountDifference))}</td>
                  <td>{match.timeDifferenceMinutes === null ? '—' : `${Math.round(match.timeDifferenceMinutes)}m`}</td>
                  <td><span className={`status-pill status-pill--${match.type.toLowerCase()}`}>{decisionLabel(match.type)}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selected && <MatchEvidence match={matches.find((match) => `${match.pos.id}::${match.settlement.id}` === selected) ?? null} />}
    </div>
  )
}

function decisionLabel(type: Match['type']): string {
  if (type === 'MANUAL') return 'MANUAL OVERRIDE'
  if (type === 'ACCEPTED') return 'REVIEWER ACCEPTED'
  return 'AUTO'
}

function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><strong>{title}</strong><span>{detail}</span></div>
}
