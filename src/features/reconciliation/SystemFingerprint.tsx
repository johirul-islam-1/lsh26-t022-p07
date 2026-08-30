export function SystemFingerprint({ result }: { result: { fingerprint: { referenceStyle: string; duplicateConflicts: number; confidence: string } } }) {
  return (
    <article className="panel">
      <div className="panel__head"><div><span className="eyebrow">System fingerprint</span><h3>Learning seam ready</h3></div><span className="badge badge--warn">Build 1</span></div>
      <dl className="fact-list">
        <Fact label="Reference convention" value={result.fingerprint.referenceStyle} />
        <Fact label="Settlement fee" value="Pending seed inference" />
        <Fact label="Clock shift" value="Pending seed inference" />
        <Fact label="Duplicate signals" value={String(result.fingerprint.duplicateConflicts)} />
        <Fact label="Pattern confidence" value={result.fingerprint.confidence} />
      </dl>
    </article>
  )
}
function Fact({ label, value }: { label: string; value: string }) { return <div className="fact"><dt>{label}</dt><dd>{value}</dd></div> }
