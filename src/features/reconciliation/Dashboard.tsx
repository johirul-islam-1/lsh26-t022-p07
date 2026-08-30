'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, GitCompareArrows, ShieldCheck } from 'lucide-react'
import { CaseSelector } from './CaseSelector'
import { MatchTabs } from './MatchTabs'
import { SummaryCards } from './SummaryCards'
import { SystemFingerprint } from './SystemFingerprint'

type ApiResult = {
  build: string
  case: { id: string; today: string }
  profile: {
    referenceStyle: string
    afterMidnightCount: number
    duplicatePosCount: number
    duplicateSettlementCount: number
  }
  fingerprint: {
    referenceStyle: string
    settlementFee: number | null
    feeSupport: number
    timeOffsetMinutes: number | null
    timeSupport: number
    duplicateConflicts: number
    confidence: string
  }
  metrics: {
    posCount: number
    settlementCount: number
    posTotal: number
    settlementTotal: number
    unmatchedPosCount: number
    unmatchedSettlementCount: number
  }
}

export function Dashboard({ caseIds, schemaVersion }: { caseIds: string[]; schemaVersion: string }) {
  const [caseId, setCaseId] = useState(caseIds[0] ?? '')
  const [result, setResult] = useState<ApiResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCase = useCallback(async (selectedCaseId: string) => {
    if (!selectedCaseId) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseId, decisions: { accepted: [], rejected: [], manual: [] } })
      })
      const body: unknown = await response.json()
      if (!response.ok) throw new Error(`Reconciliation API failed (${response.status})`)
      setResult(body as ApiResult)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load case')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadCase(caseId) }, [caseId, loadCase])

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Exps · LSH26-T022 · P07</div>
          <h1>ReconFlow</h1>
          <p className="subtitle">Explainable POS ↔ settlement reconciliation</p>
        </div>
        <div className="topbar__status">
          <Status icon={<CheckCircle2 size={14} />} text="Build 0 foundation" tone="good" />
          <Status icon={<ShieldCheck size={14} />} text="Deterministic" />
          <Status icon={<GitCompareArrows size={14} />} text="Same-origin API" />
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="kicker">Foundation aligned to the locked Next.js architecture</p>
          <h2>Automate the obvious. Surface the uncertain. Never fake confidence.</h2>
          <p>
            Build 0 validates the organizer fixture, money/reference contracts, Next.js API boundary,
            health endpoint, CI and Render topology. The matcher remains intentionally pending until Build 1.
          </p>
        </div>
        <CaseSelector caseIds={caseIds} value={caseId} onChange={setCaseId} />
      </section>

      {loading && <div className="notice"><span className="spinner" /> Loading {caseId} through /api/reconcile…</div>}
      {error && <div className="notice notice--error">{error} <button onClick={() => void loadCase(caseId)}>Retry</button></div>}

      {result && !loading && !error && (
        <>
          <SummaryCards metrics={result.metrics} />
          <section className="content-grid">
            <SystemFingerprint result={result} />
            <article className="panel">
              <div className="panel__head"><div><span className="eyebrow">Input contract</span><h3>Case intelligence</h3></div></div>
              <dl className="fact-list">
                <Fact label="Business date" value={result.case.today} />
                <Fact label="Reference style" value={result.profile.referenceStyle} />
                <Fact label="After-midnight settlements" value={String(result.profile.afterMidnightCount)} />
                <Fact label="Duplicate POS rows" value={String(result.profile.duplicatePosCount)} />
                <Fact label="Duplicate settlement rows" value={String(result.profile.duplicateSettlementCount)} />
              </dl>
            </article>
            <MatchTabs result={result} />
          </section>
        </>
      )}

      <footer className="footer-note">
        <span><Database size={12} /> fixture schema v{schemaVersion}</span>
        <span>{caseIds.length} organizer cases</span>
        <span>/healthz · Next.js production server</span>
      </footer>
    </main>
  )
}

function Status({ icon, text, tone = 'neutral' }: { icon: React.ReactNode; text: string; tone?: 'neutral' | 'good' }) {
  return <span className={`badge badge--${tone}`}>{icon}{text}</span>
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact"><dt>{label}</dt><dd>{value}</dd></div>
}
