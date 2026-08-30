import { Fingerprint, Gauge, GitCommitHorizontal } from 'lucide-react'
import type { ReconciliationResult } from '@/domain/reconciliation/types'

export function SystemFingerprint({ result }: { result: ReconciliationResult }) {
  const { fingerprint } = result
  const fee = fingerprint.settlementFee === null ? null : fingerprint.settlementFee * 100
  const offset = fingerprint.timeOffsetMinutes

  return (
    <article className="panel fingerprint-panel">
      <div className="panel__head">
        <div><span className="eyebrow">System fingerprint</span><h3>Learned operating rule</h3></div>
        <span className={`badge badge--${fingerprint.confidence === 'HIGH' ? 'good' : 'warn'}`}><Fingerprint size={13} /> {fingerprint.confidence}</span>
      </div>

      <div className="learned-rule">
        <span>ReconFlow inferred from {fingerprint.seedCount} unique seed pairs</span>
        <strong>
          Settlement ≈ POS {fee === null ? '× learned ratio' : `× ${(1 - (fingerprint.settlementFee ?? 0)).toFixed(4)}`}
          {' · '}
          Time ≈ POS {offset === null ? '+ learned shift' : formatOffset(offset)}
        </strong>
      </div>

      <dl className="fact-list">
        <Fact label="Reference convention" value={fingerprint.referenceStyle} />
        <Fact label="Settlement fee" value={fee === null ? 'Unknown' : `${fee.toFixed(2)}%`} />
        <Fact label="Clock shift" value={offset === null ? 'Unknown' : formatOffset(offset)} />
        <Fact label="Duplicate conflict keys" value={String(fingerprint.duplicateConflicts)} />
      </dl>

      <div className="support-grid">
        <Support label="Fee support" value={fingerprint.feeSupport} />
        <Support label="Time support" value={fingerprint.timeSupport} />
      </div>

      <div className="fingerprint-note"><GitCommitHorizontal size={14} /> Learned per case; never hard-coded across organizer datasets.</div>
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

function Support({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 100)
  return (
    <div className="support-meter">
      <div><span><Gauge size={12} /> {label}</span><b>{percent}%</b></div>
      <div className="support-meter__bar"><i style={{ width: `${percent}%` }} /></div>
    </div>
  )
}
