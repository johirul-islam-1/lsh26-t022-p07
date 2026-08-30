import type { Match } from '@/domain/reconciliation/types'
import { formatBdt } from '@/lib/format'

export function MatchEvidence({ match }: { match: Match | null }) {
  if (!match) return null
  const manual = match.type === 'MANUAL'
  return (
    <section className="evidence-card">
      <div className="panel__head">
        <div><span className="eyebrow">Why this pair</span><h3>{match.pos.id} ↔ {match.settlement.id}</h3></div>
        <strong>{manual ? 'Human override' : `${Math.round(match.confidence * 100)}% evidence`}</strong>
      </div>
      {manual && (
        <div className="manual-evidence-note">
          Engine evidence score: <b>{Math.round(match.confidence * 100)}%</b>. ReconFlow did not claim this as an automatic match; a reviewer explicitly paired it.
        </div>
      )}
      <div className="signal-grid">
        <Signal label="Reference" score={match.signals.reference} detail={`${match.pos.reference} → ${match.settlement.reference}`} />
        <Signal label="Fee-adjusted amount" score={match.signals.amount} detail={match.expectedSettlementAmount === null ? 'No learned fee' : `Expected ${formatBdt(match.expectedSettlementAmount)} · actual ${formatBdt(Number(match.settlement.amount_bdt) * 100)}`} />
        <Signal label="Corrected time" score={match.signals.time} detail={match.expectedSettlementTime ? `Expected ${match.expectedSettlementTime.replace('T', ' ')} · Δ ${Math.round(match.timeDifferenceMinutes ?? 0)}m` : 'No learned offset'} />
      </div>
      <div className="safety-list">
        {match.explanation.map((line) => <span key={line}>{manual ? '•' : '✓'} {line}</span>)}
      </div>
    </section>
  )
}

function Signal({ label, score, detail }: { label: string; score: number; detail: string }) {
  return <div className="signal"><div><strong>{label}</strong><b>{Math.round(score * 100)}%</b></div><span>{detail}</span><div className="signal__bar"><i style={{ width: `${Math.round(score * 100)}%` }} /></div></div>
}
