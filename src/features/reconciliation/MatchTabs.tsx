'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { AlertTriangle, CheckCircle2, Database, SearchX } from 'lucide-react'
import type { PairDecision } from '@/schemas/reconciliation'
import type { ReconciliationResult } from '@/domain/reconciliation/types'
import { MatchedTable } from './MatchedTable'
import { ReviewQueue } from './ReviewQueue'
import { SourceData } from './SourceData'
import { UnmatchedPanel } from './UnmatchedPanel'

export function MatchTabs({
  result,
  busy,
  onAccept,
  onReject,
  onManualPair
}: {
  result: ReconciliationResult
  busy: boolean
  onAccept: (pair: PairDecision) => void
  onReject: (pair: PairDecision) => void
  onManualPair: (pair: PairDecision) => void
}) {
  return (
    <article className="panel panel--wide">
      <div className="panel__head">
        <div><span className="eyebrow">Reconciliation workspace</span><h3>Matched · Possible · Unmatched</h3></div>
        <span className="badge badge--good"><CheckCircle2 size={14} /> Live recomputation</span>
      </div>
      <Tabs.Root defaultValue="matched">
        <Tabs.List className="tabs-list" aria-label="Reconciliation states">
          <Tabs.Trigger className="tab" value="matched"><CheckCircle2 size={15} /> Matched <b>{result.metrics.matchedCount}</b></Tabs.Trigger>
          <Tabs.Trigger className="tab" value="review"><AlertTriangle size={15} /> Needs review <b>{result.metrics.reviewCount}</b></Tabs.Trigger>
          <Tabs.Trigger className="tab" value="unmatched"><SearchX size={15} /> Unmatched <b>{result.metrics.unmatchedPosCount}/{result.metrics.unmatchedSettlementCount}</b></Tabs.Trigger>
          <Tabs.Trigger className="tab" value="source"><Database size={15} /> Source data <b>{result.metrics.posCount}/{result.metrics.settlementCount}</b></Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="tab-content" value="matched"><MatchedTable matches={result.matched} /></Tabs.Content>
        <Tabs.Content className="tab-content" value="review"><ReviewQueue items={result.review} busy={busy} onAccept={onAccept} onReject={onReject} /></Tabs.Content>
        <Tabs.Content className="tab-content" value="unmatched"><UnmatchedPanel unmatched={result.unmatched} busy={busy} onManualPair={onManualPair} /></Tabs.Content>
        <Tabs.Content className="tab-content" value="source"><SourceData source={result.source} /></Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
