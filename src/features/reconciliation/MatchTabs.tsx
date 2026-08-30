'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { AlertTriangle, CheckCircle2, Database, SearchX } from 'lucide-react'

export function MatchTabs({ result }: { result: { metrics: { posCount: number; settlementCount: number; unmatchedPosCount: number; unmatchedSettlementCount: number } } }) {
  return (
    <article className="panel panel--wide">
      <div className="panel__head">
        <div><span className="eyebrow">Human-in-the-loop contract</span><h3>Decision lanes</h3></div>
        <span className="badge badge--warn"><AlertTriangle size={14} /> Matcher intentionally pending</span>
      </div>
      <Tabs.Root defaultValue="matched">
        <Tabs.List className="tabs-list" aria-label="Build 1 workflow slots">
          <Tabs.Trigger className="tab" value="matched"><CheckCircle2 size={15} /> Matched</Tabs.Trigger>
          <Tabs.Trigger className="tab" value="review"><AlertTriangle size={15} /> Needs review</Tabs.Trigger>
          <Tabs.Trigger className="tab" value="unmatched"><SearchX size={15} /> Unmatched</Tabs.Trigger>
          <Tabs.Trigger className="tab" value="source"><Database size={15} /> Source data</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="tab-content" value="matched">Build 1 will place only safe mutual-best matches here with evidence.</Tabs.Content>
        <Tabs.Content className="tab-content" value="review">Duplicate/conflicting candidates will be surfaced here instead of guessed.</Tabs.Content>
        <Tabs.Content className="tab-content" value="unmatched">Current skeleton preserves {result.metrics.unmatchedPosCount} POS and {result.metrics.unmatchedSettlementCount} settlement rows as unmatched until the matcher is implemented.</Tabs.Content>
        <Tabs.Content className="tab-content" value="source">Organizer case contains {result.metrics.posCount} POS rows and {result.metrics.settlementCount} settlement rows.</Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
