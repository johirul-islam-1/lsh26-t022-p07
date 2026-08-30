import type { ReconciliationResult } from '@/domain/reconciliation/types'

export function SystemFingerprint({ result }: { result: ReconciliationResult }) {
  const { fingerprint } = result
  return (
    <article className="panel">
      <div className="panel__head">
        <div><span className="eyebrow">System fingerprint</span><h3>How the two systems disagree</h3></div>
        <span className={`badge badge--${fingerprint.confidence === 'HIGH' ? 'good' : 'warn'}`}>{fingerprint.confidence} confidence</span>
      </div>
      <dl className="fact-list">
        <Fact label="Reference convention" value={fingerprint.referenceStyle} />
        <Fact label="Settlement fee" value={fingerprint.settlementFee === null ? 'Unknown' : `${(fingerprint.settlementFee * 100).toFixed(2)}%`} />
        <Fact label="Fee support" value={`${Math.round(fingerprint.feeSupport * 100)}%`} />
        <Fact label="Clock shift" value={fingerprint.timeOffsetMinutes === null ? 'Unknown' : formatOffset(fingerprint.timeOffsetMinutes)} />
        <Fact label="Time support" value={`${Math.round(fingerprint.timeSupport * 100)}%`} />
        <Fact label="High-trust seed pairs" value={String(fingerprint.seedCount)} />
        <Fact label="Duplicate conflict keys" value={String(fingerprint.duplicateConflicts)} />
      </dl>
    </article>
  )
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '−'
  const absolute = Math.abs(minutes)
  const hours = Math.floor(absolute / 60)
  const remainder = Math.round(absolute % 60)
  return remainder === 0 ? `${sign}${hours}h` : `${sign}${hours}h ${remainder}m`
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact"><dt>{label}</dt><dd>{value}</dd></div>
}
