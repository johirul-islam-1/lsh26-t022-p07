'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, GitCompareArrows, RotateCcw, ShieldCheck } from 'lucide-react'
import type { PairDecision } from '@/schemas/reconciliation'
import type { ReconciliationResult } from '@/domain/reconciliation/types'
import { CaseSelector } from './CaseSelector'
import { MatchTabs } from './MatchTabs'
import { SummaryCards } from './SummaryCards'
import { SystemFingerprint } from './SystemFingerprint'

type Decisions = ReconciliationResult['decisions']

function emptyDecisions(): Decisions {
  return { accepted: [], rejected: [], manual: [] }
}

export function Dashboard({ caseIds, schemaVersion }: { caseIds: string[]; schemaVersion: string }) {
  const [caseId, setCaseId] = useState(caseIds[0] ?? '')
  const [decisions, setDecisions] = useState<Decisions>(emptyDecisions)
  const [result, setResult] = useState<ReconciliationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reconcileCase = useCallback(async (selectedCaseId: string, nextDecisions: Decisions, mode: 'load' | 'action' = 'load') => {
    if (!selectedCaseId) return
    if (mode === 'load') setLoading(true)
    else setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseId, decisions: nextDecisions })
      })
      const body: unknown = await response.json()
      if (!response.ok) throw new Error(`Reconciliation API failed (${response.status})`)
      setResult(body as ReconciliationResult)
      setDecisions(nextDecisions)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reconcile case')
    } finally {
      setLoading(false)
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    const fresh = emptyDecisions()
    setDecisions(fresh)
    void reconcileCase(caseId, fresh)
  }, [caseId, reconcileCase])

  const acceptPair = (pair: PairDecision) => {
    const next: Decisions = {
      ...decisions,
      accepted: addUniquePair(decisions.accepted, pair),
      rejected: decisions.rejected.filter((item) => !samePair(item, pair))
    }
    void reconcileCase(caseId, next, 'action')
  }

  const rejectPair = (pair: PairDecision) => {
    const next: Decisions = {
      ...decisions,
      rejected: addUniquePair(decisions.rejected, pair),
      accepted: decisions.accepted.filter((item) => !samePair(item, pair))
    }
    void reconcileCase(caseId, next, 'action')
  }

  const manualPair = (pair: PairDecision) => {
    const next: Decisions = {
      ...decisions,
      manual: addUniquePair(decisions.manual, pair),
      rejected: decisions.rejected.filter((item) => !samePair(item, pair))
    }
    void reconcileCase(caseId, next, 'action')
  }

  const resetDecisions = () => {
    const fresh = emptyDecisions()
    void reconcileCase(caseId, fresh, 'action')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Exps · LSH26-T022 · P07</div>
          <h1>ReconFlow</h1>
          <p className="subtitle">Explainable POS ↔ settlement reconciliation</p>
        </div>
        <div className="topbar__status">
          <Status icon={<CheckCircle2 size={14} />} text="Build 1 · 4/4 MVP" tone="good" />
          <Status icon={<ShieldCheck size={14} />} text="Deterministic" />
          <Status icon={<GitCompareArrows size={14} />} text="Human-in-the-loop" />
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="kicker">Multi-pass deterministic reconciliation</p>
          <h2>Learn the system pattern. Clear only what the evidence can defend.</h2>
          <p>
            ReconFlow canonicalizes messy references, infers the settlement fee and clock shift from clean seed pairs,
            then combines reference, fee-adjusted amount and corrected-time evidence. Ambiguity stays visible for review.
          </p>
        </div>
        <div className="hero-actions">
          <CaseSelector caseIds={caseIds} value={caseId} onChange={setCaseId} />
          <button className="button button--ghost" onClick={resetDecisions} disabled={busy || loading}>
            <RotateCcw size={14} /> Reset decisions
          </button>
        </div>
      </section>

      {loading && <div className="notice"><span className="spinner" /> Running reconciliation for {caseId}…</div>}
      {busy && <div className="notice notice--floating"><span className="spinner" /> Recalculating after reviewer decision…</div>}
      {error && <div className="notice notice--error">{error} <button onClick={() => void reconcileCase(caseId, decisions, 'action')}>Retry</button></div>}

      {result && !loading && (
        <>
          <SummaryCards metrics={result.metrics} />
          <section className="content-grid">
            <SystemFingerprint result={result} />
            <article className="panel">
              <div className="panel__head"><div><span className="eyebrow">Case intelligence</span><h3>Source profile</h3></div></div>
              <dl className="fact-list">
                <Fact label="Business date" value={result.case.today} />
                <Fact label="Reference style" value={result.profile.referenceStyle} />
                <Fact label="After-midnight settlements" value={String(result.profile.afterMidnightCount)} />
                <Fact label="Duplicate POS rows" value={String(result.profile.duplicatePosCount)} />
                <Fact label="Duplicate settlement rows" value={String(result.profile.duplicateSettlementCount)} />
              </dl>
            </article>
            <MatchTabs
              result={result}
              busy={busy}
              onAccept={acceptPair}
              onReject={rejectPair}
              onManualPair={manualPair}
            />
          </section>
          {result.decisionWarnings.length > 0 && (
            <div className="notice notice--warn">{result.decisionWarnings.join(' · ')}</div>
          )}
        </>
      )}

      <footer className="footer-note">
        <span><Database size={12} /> fixture schema v{schemaVersion}</span>
        <span>{caseIds.length} organizer cases loaded</span>
        <span>/api/reconcile · /healthz · same origin</span>
      </footer>
    </main>
  )
}

function addUniquePair(items: PairDecision[], pair: PairDecision): PairDecision[] {
  return items.some((item) => samePair(item, pair)) ? items : [...items, pair]
}

function samePair(left: PairDecision, right: PairDecision): boolean {
  return left.posId === right.posId && left.settlementId === right.settlementId
}

function Status({ icon, text, tone = 'neutral' }: { icon: React.ReactNode; text: string; tone?: 'neutral' | 'good' }) {
  return <span className={`badge badge--${tone}`}>{icon}{text}</span>
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact"><dt>{label}</dt><dd>{value}</dd></div>
}
