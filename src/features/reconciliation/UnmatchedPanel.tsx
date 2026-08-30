'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link2 } from 'lucide-react'
import type { PairDecision, Transaction } from '@/schemas/reconciliation'
import { formatBdt } from '@/lib/format'

export function UnmatchedPanel({ unmatched, busy, onManualPair }: {
  unmatched: { pos: Transaction[]; settlement: Transaction[] }
  busy: boolean
  onManualPair: (pair: PairDecision) => void
}) {
  const [posId, setPosId] = useState(unmatched.pos[0]?.id ?? '')
  const [settlementId, setSettlementId] = useState(unmatched.settlement[0]?.id ?? '')

  useEffect(() => { setPosId(unmatched.pos[0]?.id ?? '') }, [unmatched.pos])
  useEffect(() => { setSettlementId(unmatched.settlement[0]?.id ?? '') }, [unmatched.settlement])

  const pos = useMemo(() => unmatched.pos.find((row) => row.id === posId), [posId, unmatched.pos])
  const settlement = useMemo(() => unmatched.settlement.find((row) => row.id === settlementId), [settlementId, unmatched.settlement])

  if (unmatched.pos.length === 0 && unmatched.settlement.length === 0) {
    return <div className="empty-state"><strong>No unmatched records</strong><span>Every remaining source record is either reconciled or awaiting review.</span></div>
  }

  return (
    <div className="stack">
      <div className="unmatched-summary">
        <div><strong>{unmatched.pos.length}</strong><span>POS without defensible counterpart</span></div>
        <div><strong>{unmatched.settlement.length}</strong><span>Settlement without defensible counterpart</span></div>
      </div>
      <div className="manual-pair">
        <div>
          <label htmlFor="manual-pos">POS record</label>
          <select id="manual-pos" value={posId} onChange={(event) => setPosId(event.target.value)}>
            {unmatched.pos.map((row) => <option key={row.id} value={row.id}>{row.id} · {row.reference} · {row.amount_bdt}</option>)}
          </select>
          {pos && <TransactionPreview row={pos} />}
        </div>
        <div>
          <label htmlFor="manual-settlement">Settlement record</label>
          <select id="manual-settlement" value={settlementId} onChange={(event) => setSettlementId(event.target.value)}>
            {unmatched.settlement.map((row) => <option key={row.id} value={row.id}>{row.id} · {row.reference} · {row.amount_bdt}</option>)}
          </select>
          {settlement && <TransactionPreview row={settlement} />}
        </div>
      </div>
      <button
        className="button button--primary"
        disabled={busy || !pos || !settlement}
        onClick={() => pos && settlement && onManualPair({ posId: pos.id, settlementId: settlement.id })}
      >
        <Link2 size={15} /> Confirm manual pair
      </button>
      <p className="helper-text">Manual pairing is recorded as a human decision, never as automatic confidence.</p>
    </div>
  )
}

function TransactionPreview({ row }: { row: Transaction }) {
  return <div className="transaction-preview"><strong>{formatBdt(Number(row.amount_bdt) * 100)}</strong><span>{row.reference}</span><small>{row.time.replace('T', ' ')}</small></div>
}
