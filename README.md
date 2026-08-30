# ReconFlow

### Explainable Two-Source Sales Reconciliation Engine

**Team:** Exps  
**Team ID:** `LSH26-T022`  
**Hackathon:** LofiStack Hackathon 2026  
**Problem:** `P07 — Two-Source Sales Reconciliation Engine`

**Live Application:**  
https://lsh26-t022-p07.onrender.com

**Repository:**  
https://github.com/johirul-islam-1/lsh26-t022-p07

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [The Problem](#the-problem)
- [Why Existing Approaches Fail](#why-existing-approaches-fail)
- [Our Solution](#our-solution)
- [Product Goals](#product-goals)
- [Non-Goals](#non-goals)
- [P07 Requirement Coverage](#p07-requirement-coverage)
- [User Workflow](#user-workflow)
- [Core Product Concepts](#core-product-concepts)
- [Reconciliation Engine](#reconciliation-engine)
- [Matching Model](#matching-model)
- [Safety Policy](#safety-policy)
- [Exception Intelligence](#exception-intelligence)
- [Human-in-the-Loop Reconciliation](#human-in-the-loop-reconciliation)
- [Financial Bridge](#financial-bridge)
- [Audit and Persistence](#audit-and-persistence)
- [System Design](#system-design)
- [Architecture](#architecture)
- [Request Flow](#request-flow)
- [Folder Structure](#folder-structure)
- [API Design](#api-design)
- [Data Model](#data-model)
- [Correctness Invariants](#correctness-invariants)
- [Testing Strategy](#testing-strategy)
- [Technology Stack](#technology-stack)
- [Local Development](#local-development)
- [Deployment Architecture](#deployment-architecture)
- [Design Decisions and Trade-offs](#design-decisions-and-trade-offs)
- [Security and Privacy](#security-and-privacy)
- [Known Limitations](#known-limitations)
- [Production Roadmap](#production-roadmap)
- [Demo Walkthrough](#demo-walkthrough)
- [Judge Summary](#judge-summary)
- [License and Attribution](#license-and-attribution)

---

# Executive Summary

ReconFlow is an explainable reconciliation system designed to reconcile two messy financial datasets:

1. a **POS transaction report**, and
2. a **settlement report**.

These datasets describe many of the same transactions, but they do not necessarily agree directly.

The same transaction may appear with:

- different reference formats;
- different amounts because of settlement fees;
- different timestamps because the systems use different clocks;
- midnight-crossing timestamps;
- duplicate transaction references;
- missing transactions;
- multiple plausible matches.

A simple exact join cannot solve this reliably.

A naive fuzzy matcher is also unsafe because a transaction can appear highly similar while still being ambiguous.

ReconFlow instead:

1. profiles both datasets;
2. normalizes transaction references;
3. discovers high-confidence seed matches;
4. learns the relationship between the two systems;
5. scores remaining candidate pairs using multiple signals;
6. automatically clears only safe matches;
7. sends ambiguous cases to human review;
8. explains why each exception exists;
9. allows Accept, Reject and Manual Pair decisions;
10. recalculates reconciliation and financial totals immediately.

The result is not just a matching algorithm.

It is a **human-in-the-loop financial reconciliation workflow**.

---

# The Problem

Financial reconciliation becomes difficult when two systems describe the same transaction differently.

Consider a POS system recording:

```text
Reference: INV-2026-069080
Amount:    ৳1,000.00
Time:      10:15
```

while the settlement system records:

```text
Reference: inv_2026_69080
Amount:    ৳970.00
Time:      17:15
```

At first glance, all three fields disagree.

However, this may actually be the same transaction:

```text
INV-2026-069080
        ↓
inv_2026_69080
```

The reference formatting changed.

```text
৳1,000 × 0.97 = ৳970
```

The settlement provider deducted a 3% fee.

```text
10:15 + 7 hours = 17:15
```

The settlement system clock is seven hours ahead.

Individually, each difference looks like an error.

Together, they describe a consistent relationship between the two systems.

---

# Why Existing Approaches Fail

## Exact matching

A traditional database join might attempt:

```text
POS.reference = Settlement.reference
AND
POS.amount = Settlement.amount
AND
POS.time = Settlement.time
```

This fails as soon as formatting, fees or timestamps differ.

---

## Reference-only matching

Reference normalization improves matching, but it is not enough.

Two POS transactions may share the same reference.

For example:

```text
POS-003 ─┐
         ├── same reference ── STL-003
POS-004 ─┘
```

Even if the reference matches perfectly, automatically selecting one transaction could create a financial error.

---

## Amount-only matching

Amounts can repeat frequently.

A value such as:

```text
৳500.00
```

may occur many times in one report.

The settlement value may also differ because of a fee.

---

## Timestamp-only matching

Clock offsets and midnight crossings make direct timestamp comparisons unreliable.

---

## Pure fuzzy matching

A fuzzy score can produce something like:

```text
Reference: 100%
Amount:    100%
Time:      100%
```

but still be unsafe if two transactions compete for the same settlement record.

Therefore:

> **Similarity is not the same as certainty.**

ReconFlow separates **matching evidence** from **matching safety**.

---

# Our Solution

ReconFlow uses a deterministic multi-pass reconciliation strategy.

```text
Raw POS + Settlement reports
            |
            v
      Input validation
            |
            v
       Source profiling
            |
            v
 Reference canonicalization
            |
            v
  High-trust seed discovery
            |
            v
  System fingerprint learning
            |
            v
    Candidate generation
            |
            v
  Multi-signal pair scoring
            |
            v
 Conflict + ambiguity analysis
            |
      +-----+------+
      |            |
      v            v
 Safe Auto      Needs Review
 Matches             |
                     v
                Human Decision
                     |
                     v
             Re-run reconciliation
                     |
                     v
             Financial summary
```

The key idea is:

> **First learn how the two systems disagree. Then use that learned relationship to reconcile the rest.**

---

# Product Goals

ReconFlow was designed around five product goals.

## 1. Correctness

Never consume the same financial record twice.

## 2. Conservative automation

Automatically clear only transactions that satisfy strong evidence and safety constraints.

## 3. Explainability

Every uncertain result should tell the operator **why** it was not automatically matched.

## 4. Human control

A reviewer must be able to override the engine through explicit decisions.

## 5. Financial visibility

The operator should understand the monetary impact of unresolved reconciliation, not only record counts.

---

# Non-Goals

The hackathon MVP intentionally does not attempt to build:

- a full accounting platform;
- merchant authentication;
- multi-tenant SaaS infrastructure;
- settlement-provider integrations;
- a persistent database;
- role-based access control;
- arbitrary spreadsheet ingestion;
- machine-learning model training;
- LLM-based reconciliation;
- distributed job processing.

These features are possible extensions but are unnecessary for proving the core reconciliation approach.

---

# P07 Requirement Coverage

| P07 Requirement | ReconFlow Implementation |
| --- | --- |
| Two messy datasets containing at least 80 records each | Organizer-provided POS and settlement reports are displayed directly in Source Data |
| Reconcile using reference, fee-adjusted amount and time offset | Semantic reference normalization + learned fee + learned clock offset |
| Separate Matched / Possible / Unmatched | Matched / Needs Review / Unmatched product workflow |
| Show counts and monetary values | Summary cards and Financial Bridge |
| Human Accept decision | Implemented |
| Human Reject decision | Implemented |
| Manual Pair decision | Implemented |
| Human decisions change results immediately | Every decision re-runs reconciliation |
| Prevent double-use of records | Enforced by reconciliation invariants |
| Explain uncertain matches | Reason codes + “Why not auto-matched?” |
| Handle duplicate ambiguity | Explicit `DUPLICATE_CONFLICT` detection |

---

# User Workflow

The primary user is a financial operations or reconciliation analyst.

A typical workflow is:

```text
1. Select reconciliation case
        ↓
2. Inspect source totals
        ↓
3. Review learned System Fingerprint
        ↓
4. Inspect automatically matched transactions
        ↓
5. Review ambiguous exceptions
        ↓
6. Accept / Reject candidates
        ↓
7. Manually pair unmatched transactions when required
        ↓
8. Monitor financial impact
        ↓
9. Review audit timeline
        ↓
10. Complete end-of-day reconciliation
```

---

# Core Product Concepts

## Case

A case represents one reconciliation run containing:

```text
POS transactions
+
Settlement transactions
```

The organizer fixture contains:

```text
PUB-01
PUB-02
...
PUB-25
```

---

## System Fingerprint

A **System Fingerprint** describes the learned relationship between the two reports.

For example:

```text
Settlement ≈ POS × 0.9700
Time ≈ POS +7h
```

This means:

```text
Settlement amount ≈ 97% of POS amount
```

or approximately:

```text
3% settlement fee
```

and:

```text
Settlement clock ≈ POS clock + 7 hours
```

The UI also shows how strongly the source data supports those inferred rules.

---

## Candidate Pair

A candidate is a possible relationship:

```text
POS transaction
        ↕
Settlement transaction
```

Candidate evidence is calculated from multiple independent signals.

---

## Automatic Match

A candidate that passes both:

```text
high evidence
+
safety constraints
```

---

## Needs Review

A plausible candidate that is not safe enough for automatic reconciliation.

---

## Unmatched

A record for which no acceptable counterpart exists.

---

# Reconciliation Engine

The engine is implemented as a deterministic pipeline inside:

```text
src/domain/reconciliation/
```

There are no external AI calls or hidden services involved in matching.

---

## Phase 1 — Input Validation

The organizer fixture is validated at the application boundary using Zod.

The source schema contains case-level data and two transaction collections:

```text
case
├── POS
└── Settlement
```

Every transaction includes the relevant fields:

```text
id
reference
amount
time
```

Validation prevents malformed input from entering the reconciliation engine.

---

# Phase 2 — Source Profiling

Before matching anything, ReconFlow profiles both sources.

The profiler calculates information such as:

- POS count;
- settlement count;
- total values;
- duplicate references;
- time patterns;
- after-midnight records;
- reference characteristics.

This establishes the basic structure of the case.

---

# Phase 3 — Reference Canonicalization

Real financial systems frequently transform transaction identifiers.

ReconFlow converts equivalent formats into a shared semantic reference.

Examples:

```text
INV-2026-069080
inv_2026_69080
2026069080
069080/2026/INV
```

can resolve to a common identity such as:

```text
2026:69080
```

This allows reference comparison based on transaction identity rather than raw string equality.

Relevant module:

```text
src/domain/reconciliation/reference.ts
```

---

# Phase 4 — High-Trust Seed Discovery

ReconFlow does not initially assume the settlement fee or clock difference.

Instead, it discovers highly reliable seed pairs.

A seed should have strong identifying evidence and low ambiguity.

These pairs are used to learn how the systems relate.

This approach avoids hardcoding case-specific values.

---

# Phase 5 — System Fingerprint Inference

Seed pairs are analyzed to infer dominant patterns.

The engine learns:

## Settlement fee

If several reliable pairs satisfy:

```text
Settlement ≈ POS × 0.97
```

ReconFlow can infer approximately:

```text
3% fee
```

---

## Clock offset

If reliable transactions repeatedly show:

```text
Settlement Time - POS Time ≈ 420 minutes
```

the engine learns:

```text
+420 minutes
=
+7 hours
```

---

## Reference convention

Seed pairs also provide evidence about how transaction references are transformed between systems.

Relevant module:

```text
src/domain/reconciliation/fingerprint.ts
```

---

# Phase 6 — Candidate Generation

For every unresolved POS transaction, ReconFlow identifies plausible settlement candidates.

The candidate stage avoids blindly pairing every record with every other record.

Candidate generation uses normalized transaction information to identify meaningful possibilities.

Relevant module:

```text
src/domain/reconciliation/candidates.ts
```

---

# Matching Model

Each candidate is evaluated using three core signals.

## Reference signal

Measures whether both records appear to represent the same transaction identity after semantic normalization.

Default contribution:

```text
45%
```

---

## Amount signal

Measures whether settlement value agrees with the learned fee model.

Conceptually:

```text
Expected settlement
=
POS amount × learned settlement ratio
```

Default contribution:

```text
35%
```

---

## Time signal

Measures whether the timestamps agree after applying the learned system clock offset.

Conceptually:

```text
Expected settlement time
=
POS time + learned offset
```

Default contribution:

```text
20%
```

---

## Combined score

Conceptually:

```text
Score =
    0.45 × ReferenceEvidence
  + 0.35 × AmountEvidence
  + 0.20 × TimeEvidence
```

This produces an interpretable evidence score rather than a black-box prediction.

Relevant modules:

```text
signals.ts
scoring.ts
candidates.ts
```

---

# Safety Policy

A high score alone does not create an automatic match.

ReconFlow uses additional safety gates.

The default automatic-match policy requires approximately:

```text
Score >= 0.88
```

plus:

```text
mutual best candidate
```

plus a confidence margin of approximately:

```text
>= 0.08
```

over the competing candidate.

The candidate must also have:

```text
no unresolved duplicate conflict
no illegal record reuse
no unresolved safety conflict
```

Candidates with meaningful evidence but insufficient safety can enter review.

The default review floor is approximately:

```text
Score >= 0.62
```

The important distinction is:

```text
Evidence score
      ≠
Permission to auto-match
```

Automatic matching requires **evidence + safety**.

---

# Duplicate Conflict Example

Suppose the engine sees:

```text
POS-003 ─┐
         ├──── STL-003
POS-004 ─┘
```

Both POS records may have:

```text
Reference evidence  100%
Amount evidence     100%
Time evidence       100%
```

A naive matcher might automatically choose one.

ReconFlow detects:

```text
DUPLICATE_CONFLICT
```

and refuses to auto-clear the transaction.

The reviewer is shown why:

```text
Candidate score is high
BUT
confidence margin is insufficient
AND
another POS record competes for the same settlement
```

This behavior is deliberately conservative because financial false positives are expensive.

---

# Exception Intelligence

ReconFlow produces machine-readable reason codes alongside human-readable explanations.

Examples include:

```text
DUPLICATE_CONFLICT
MULTIPLE_PLAUSIBLE_MATCHES
AMOUNT_OUTLIER
TIME_OUTLIER
REFERENCE_PARSE_FAILURE
MISSING_POS
MISSING_SETTLEMENT
UNEXPLAINED
```

These reason codes serve two purposes:

1. make the reconciliation engine explainable;
2. give operations teams structured categories for exception handling.

---

## Why Not Auto-Matched?

Needs Review cards explicitly answer:

> **Why wasn't this transaction automatically reconciled?**

Possible answers include:

```text
Duplicate transaction conflict
Confidence margin too small
Amount outside learned pattern
Timestamp outside learned offset
Multiple plausible matches
```

This is critical because an operator should never need to reverse-engineer the matching algorithm to understand an exception.

---

# Human-in-the-Loop Reconciliation

ReconFlow treats automation as assistance rather than absolute authority.

Reviewers have three decision types.

---

## Accept

Accept the proposed candidate:

```text
POS-X ↔ STL-Y
```

ReconFlow reserves both records and recalculates the entire reconciliation state.

---

## Reject

Reject a candidate pair.

The engine excludes that relationship and recalculates alternatives.

---

## Manual Pair

The reviewer explicitly selects:

```text
POS-X
+
STL-Y
```

and forces the relationship.

Manual matches are labelled:

```text
MANUAL OVERRIDE
```

They are not displayed as high-confidence algorithmic predictions.

That distinction preserves audit integrity.

---

# Immediate Recalculation

Every human decision results in a fresh reconciliation.

Conceptually:

```text
Current decisions
      |
      v
POST /api/reconcile
      |
      v
Reconciliation engine
      |
      v
New matched/review/unmatched partitions
      |
      v
New metrics
      |
      v
Updated UI
```

There is no independent client-side matching engine.

The API result remains the source of truth.

---

# Financial Bridge

Traditional reconciliation tools often focus only on record counts.

ReconFlow also answers:

> **How much money remains unresolved?**

The Financial Bridge exposes:

- matched POS gross value;
- matched settlement value;
- gross-to-net difference;
- unresolved POS value;
- automatic match count;
- accepted match count;
- manual override count;
- high-priority exception count.

This converts technical reconciliation results into operational financial information.

---

# End-of-Day Summary

ReconFlow generates a deterministic operational summary of the current reconciliation state.

It can communicate information such as:

```text
how many records were resolved
how many require human review
how much value remains unresolved
which exceptions are highest priority
```

The summary is designed to be useful for handoff between finance operators.

---

# Audit and Persistence

## Reviewer state

Human decisions are stored in browser `localStorage`.

State is scoped per reconciliation case.

This prevents:

```text
PUB-04 decisions
```

from leaking into:

```text
PUB-05
```

---

## Active case persistence

The selected case is also persisted.

Example:

```text
Select PUB-04
      ↓
Refresh
      ↓
PUB-04 remains selected
```

Only valid organizer case IDs are restored.

---

## Audit timeline

The application records reviewer actions such as:

```text
ACCEPT
REJECT
MANUAL
```

with pair information and timestamps.

This creates a lightweight audit trail suitable for the MVP.

---

## Reset Demo State

The operator can reset reviewer state for the current case.

Resetting does not unexpectedly change the active reconciliation case.

---

# System Design

ReconFlow uses a deliberately small architecture.

The entire system runs as one deployable web service.

```text
                         ┌───────────────────────────┐
                         │         Browser           │
                         │                           │
                         │ React reconciliation UI   │
                         │ localStorage persistence  │
                         └─────────────┬─────────────┘
                                       │
                                  Same-origin
                                     HTTP
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    v                                     v
        ┌─────────────────────┐               ┌─────────────────────┐
        │   GET /healthz      │               │ POST /api/reconcile │
        └─────────────────────┘               └──────────┬──────────┘
                                                        │
                                                        v
                                          ┌────────────────────────┐
                                          │   Input Validation     │
                                          │         Zod            │
                                          └───────────┬────────────┘
                                                      │
                                                      v
                                          ┌────────────────────────┐
                                          │ Reconciliation Domain  │
                                          │                        │
                                          │ profile                │
                                          │ canonicalize           │
                                          │ infer fingerprint      │
                                          │ generate candidates    │
                                          │ score                  │
                                          │ detect conflicts       │
                                          │ apply decisions        │
                                          │ compute metrics        │
                                          └───────────┬────────────┘
                                                      │
                                                      v
                                          ┌────────────────────────┐
                                          │ Reconciliation Result  │
                                          │                        │
                                          │ matched                │
                                          │ review                 │
                                          │ unmatched              │
                                          │ metrics                │
                                          │ fingerprint            │
                                          │ insights               │
                                          └────────────────────────┘
```

---

# Architecture

## Architecture style

ReconFlow uses:

```text
Next.js modular monolith
```

instead of separate frontend/backend services.

This was intentional.

For a four-hour hackathon MVP, separate services would introduce:

- deployment complexity;
- CORS configuration;
- additional failure points;
- service discovery;
- duplicated configuration;
- longer debugging cycles.

The modular monolith gives us:

```text
one repository
one deployment
one origin
one health check
one API boundary
```

while maintaining domain separation inside the codebase.

---

## Logical layers

```text
┌─────────────────────────────────────┐
│ Presentation Layer                  │
│ src/features/reconciliation         │
├─────────────────────────────────────┤
│ Application / API Layer             │
│ src/app/api/reconcile               │
├─────────────────────────────────────┤
│ Domain Layer                        │
│ src/domain/reconciliation           │
├─────────────────────────────────────┤
│ Validation Layer                    │
│ src/schemas                         │
├─────────────────────────────────────┤
│ Data Layer                          │
│ src/data                            │
└─────────────────────────────────────┘
```

---

# Request Flow

A typical reconciliation request follows this sequence:

```text
User selects PUB-01
        |
        v
Dashboard collects saved decisions
        |
        v
POST /api/reconcile
        |
        v
Request validated with Zod
        |
        v
Load organizer case
        |
        v
Profile source records
        |
        v
Canonicalize references
        |
        v
Discover high-trust seed pairs
        |
        v
Infer fee + clock fingerprint
        |
        v
Generate candidates
        |
        v
Calculate reference/amount/time evidence
        |
        v
Detect conflicts
        |
        v
Apply reviewer decisions
        |
        v
Run safety gates
        |
        v
Partition records:
Matched / Review / Unmatched
        |
        v
Calculate financial metrics
        |
        v
Generate competition insights
        |
        v
Return JSON
        |
        v
React UI re-renders
```

---

# Folder Structure

```text
lsh26-t022-p07/
│
├── .github/
│   └── workflows/
│       └── CI configuration
│
├── scripts/
│   └── check-event.mjs
│
├── src/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── reconcile/
│   │   │       └── route.ts
│   │   │
│   │   ├── healthz/
│   │   │   └── route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── data/
│   │   └── P07_reconciliation_public.json
│   │
│   ├── schemas/
│   │   └── reconciliation.ts
│   │
│   ├── domain/
│   │   └── reconciliation/
│   │       ├── candidates.ts
│   │       ├── config.ts
│   │       ├── conflicts.ts
│   │       ├── decisions.ts
│   │       ├── fingerprint.ts
│   │       ├── insights.ts
│   │       ├── metrics.ts
│   │       ├── money.ts
│   │       ├── profiler.ts
│   │       ├── reasons.ts
│   │       ├── reconcile.ts
│   │       ├── reference.ts
│   │       ├── scoring.ts
│   │       ├── signals.ts
│   │       └── types.ts
│   │
│   ├── features/
│   │   └── reconciliation/
│   │       ├── AuditTimeline.tsx
│   │       ├── CaseSelector.tsx
│   │       ├── Dashboard.tsx
│   │       ├── FinancialBridge.tsx
│   │       ├── ManualPairDialog.tsx
│   │       ├── MatchEvidence.tsx
│   │       ├── MatchedTable.tsx
│   │       ├── MatchTabs.tsx
│   │       ├── ReviewCard.tsx
│   │       ├── ReviewQueue.tsx
│   │       ├── SourceData.tsx
│   │       ├── SummaryCards.tsx
│   │       ├── SystemFingerprint.tsx
│   │       ├── UnmatchedPanel.tsx
│   │       └── audit.ts
│   │
│   └── lib/
│       └── format.ts
│
├── tests/
│   ├── all-cases.test.ts
│   ├── build2-insights.test.ts
│   ├── conflicts.test.ts
│   ├── decisions.test.ts
│   ├── fingerprint.test.ts
│   ├── money.test.ts
│   ├── reconciliation.test.ts
│   ├── reference.test.ts
│   └── scoring.test.ts
│
├── EVENT.md
├── LICENSES.md
├── README.md
├── evaluation-manifest.json
├── next.config.ts
├── package.json
├── package-lock.json
├── render.yaml
├── tsconfig.json
└── vitest.config.ts
```

---

# Module Responsibilities

## `reference.ts`

Responsible for:

```text
raw reference
      ↓
semantic transaction identity
```

Handles normalization across the organizer's reference formats.

---

## `money.ts`

Converts financial values into integer poisha.

Instead of performing core matching calculations using floating-point BDT values:

```text
৳123.45
```

ReconFlow internally represents:

```text
12345 poisha
```

This reduces floating-point errors in financial comparisons.

---

## `profiler.ts`

Analyzes source-level characteristics before matching.

---

## `fingerprint.ts`

Infers:

```text
settlement fee
clock offset
support for learned rules
```

from reliable seed matches.

---

## `signals.ts`

Produces individual evidence signals for a candidate pair.

---

## `scoring.ts`

Combines evidence into an interpretable candidate score.

---

## `candidates.ts`

Constructs and ranks potential POS ↔ settlement pairs.

---

## `conflicts.ts`

Detects unsafe relationships such as duplicate or competing matches.

---

## `decisions.ts`

Applies reviewer:

```text
Accept
Reject
Manual Pair
```

instructions.

---

## `metrics.ts`

Calculates record counts and financial totals.

---

## `insights.ts`

Generates competition-facing operational and financial insights.

---

## `reconcile.ts`

Acts as the reconciliation orchestrator.

It coordinates the domain modules and produces the final result.

---

# API Design

ReconFlow exposes a deliberately small API.

---

## Health Check

```http
GET /healthz
```

Example:

```json
{
  "status": "ok",
  "service": "reconflow"
}
```

Used by:

- developers;
- Render health monitoring;
- production smoke tests.

---

# List Cases

```http
GET /api/reconcile
```

Returns application metadata and available organizer cases.

Example shape:

```json
{
  "team": "Exps",
  "teamId": "LSH26-T022",
  "problemId": "P07",
  "build": "b2-competition",
  "caseIds": [
    "PUB-01",
    "PUB-02",
    "PUB-03"
  ]
}
```

---

# Reconcile Case

```http
POST /api/reconcile
Content-Type: application/json
```

Example request:

```json
{
  "caseId": "PUB-01",
  "decisions": {
    "accepted": [],
    "rejected": [],
    "manual": []
  }
}
```

The response contains the complete reconciliation state required by the UI.

Conceptually:

```text
case
fingerprint
metrics
matched
review
unmatched
financial insights
```

The browser does not independently calculate matches.

---

# Data Model

At a conceptual level:

```text
ReconciliationCase
├── caseId
├── POS[]
└── Settlement[]
```

Transaction:

```text
Transaction
├── id
├── reference
├── amount
└── time
```

Reconciliation result:

```text
ReconciliationResult
├── fingerprint
├── metrics
├── matched[]
├── review[]
└── unmatched
```

Reviewer decisions:

```text
Decisions
├── accepted[]
├── rejected[]
└── manual[]
```

---

# Correctness Invariants

Financial reconciliation requires strong invariants.

ReconFlow verifies several important properties.

---

## No POS record can be matched twice

```text
matched POS IDs must be unique
```

---

## No settlement record can be matched twice

```text
matched settlement IDs must be unique
```

---

## Record partitions must remain consistent

For POS records:

```text
matched
+
review
+
unmatched
=
source POS count
```

Equivalent consistency checks are applied to settlement usage.

---

## Human decisions must respect record ownership

A manually paired transaction cannot also be consumed by another automatic match.

---

## Reconciliation is deterministic

The same:

```text
case
+
decision state
```

produces the same reconciliation output.

There is no nondeterministic LLM dependency inside the matching engine.

---

# Testing Strategy

ReconFlow uses Vitest for domain-level verification.

The final competition build contains:

```text
9 test files
16 tests
```

covering the core reconciliation pipeline.

---

## Money tests

Validate integer-poisha financial conversion.

---

## Reference tests

Validate reference canonicalization.

---

## Fingerprint tests

Validate learned fee and time relationships.

---

## Scoring tests

Validate candidate evidence behavior.

---

## Conflict tests

Validate ambiguous and duplicate conditions.

---

## Reconciliation tests

Validate complete reconciliation outputs.

---

## Decision tests

Validate:

```text
Accept
Reject
Manual Pair
```

and recomputation behavior.

---

## Competition insight tests

Validate that financial and operational insights remain finite and valid across organizer cases.

---

## All-case regression test

Runs reconciliation across all organizer public cases.

It checks critical invariants including:

```text
no transaction double-use
consistent record partitioning
valid reconciliation output
```

This protects the matching engine against case-specific assumptions.

---

# Verified PUB-01 Baseline

The clean competition build was verified with PUB-01.

```text
POS records:                97
Settlement records:         100

Matched:                    89
Needs Review:                5
Unmatched POS:               3
Unmatched Settlement:        6

Learned settlement fee:     3.00%
Learned time offset:        +420 minutes
                            +7 hours
```

This is also useful as a production smoke-test reference.

---

# Technology Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript |
| Validation | Zod |
| Styling | Tailwind CSS |
| UI primitives | Radix UI |
| Icons | Lucide React |
| Testing | Vitest |
| Linting | ESLint |
| CI | GitHub Actions |
| Hosting | Render |

---

# Why No LLM?

ReconFlow intentionally does not require an LLM.

The problem is fundamentally a structured record-linkage problem with:

```text
reference evidence
amount relationships
time relationships
uniqueness constraints
financial correctness requirements
```

A deterministic approach provides:

- reproducible results;
- predictable behavior;
- easier debugging;
- lower latency;
- zero external model dependency;
- stronger financial auditability;
- transparent explanations.

An LLM could potentially assist with future operator explanations or arbitrary schema mapping, but it is not required for the core reconciliation decision.

---

# Local Development

## Requirements

Use a supported Node.js version matching the repository configuration.

---

## Install

```bash
npm ci
```

---

## Full verification

```bash
npm run verify
```

This performs:

```text
EVENT.md guard
      ↓
TypeScript typecheck
      ↓
ESLint
      ↓
Vitest
      ↓
Next.js production build
```

---

## Start production server locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

---

## Health check

```bash
curl http://localhost:3000/healthz
```

---

## API metadata

```bash
curl http://localhost:3000/api/reconcile
```

---

## Example reconciliation request

```bash
curl -X POST http://localhost:3000/api/reconcile \
  -H 'content-type: application/json' \
  -d '{"caseId":"PUB-01","decisions":{"accepted":[],"rejected":[],"manual":[]}}'
```

---

# Deployment Architecture

ReconFlow runs as one Render Web Service.

```text
GitHub
   |
   | push to main
   v
GitHub Actions
   |
   | validate
   v
Render
   |
   | npm ci && npm run build
   v
Next.js production server
   |
   +── /
   +── /api/reconcile
   └── /healthz
```

---

## Render configuration

Build:

```bash
npm ci && npm run build
```

Start:

```bash
npm start
```

Health endpoint:

```text
/healthz
```

No secret environment variables are required for the hackathon MVP.

---

# Continuous Integration

The CI gate validates:

```text
repository checkout
      ↓
locked dependency install
      ↓
EVENT guard
      ↓
TypeScript
      ↓
ESLint
      ↓
tests
      ↓
production build
```

Only verified builds should move to production.

---

# Git Strategy

The project was developed in staged build branches.

```text
main
│
├── Build 0
│   foundation
│
├── build/functional-mvp
│   Build 1
│   functional reconciliation engine
│
├── build/competition
│   Build 2
│   competition UX and explainability
│
└── fix/*
    targeted production fixes
```

Major checkpoints:

```text
Build 0
Foundation

Build 1
Functional reconciliation MVP

Build 2
Competition experience

Hotfix
Active-case persistence

Final docs
Submission documentation
```

---

# Design Decisions and Trade-offs

## Modular monolith instead of microservices

### Chosen

```text
Next.js frontend + API in one service
```

### Why

The reconciliation domain benefits much more from reliability and development speed than from distributed infrastructure.

For a hackathon MVP:

```text
one service
>
multiple independently deployed services
```

because the latter adds operational risk without increasing product value.

---

# Deterministic matching instead of AI classification

### Chosen

Explicit scoring and safety rules.

### Benefits

- explainability;
- repeatability;
- auditability;
- testability;
- no external API risk.

---

# Browser persistence instead of database

### Chosen

```text
localStorage
```

for reviewer progress.

### Benefits

- zero infrastructure;
- instant resume;
- no authentication dependency;
- sufficient for single-user demonstration.

### Trade-off

State does not synchronize across users or devices.

---

# Integer money representation

### Chosen

```text
poisha
```

instead of floating-point BDT.

### Why

Financial calculations should avoid avoidable floating-point precision issues.

---

# Recompute after decisions

### Chosen

Every reviewer action recalculates the result.

### Why

This prevents stale derived state and guarantees that:

```text
counts
financial totals
available matches
unmatched records
```

remain synchronized.

---

# Safety Over Maximum Automation

ReconFlow intentionally prefers:

```text
review
```

over:

```text
incorrect automatic reconciliation
```

when ambiguity exists.

For financial operations:

> A false positive can be more dangerous than an unresolved transaction.

---

# Security and Privacy

The hackathon fixture contains synthetic/organizer-provided reconciliation data.

ReconFlow sends no reconciliation data to:

- external APIs;
- AI providers;
- analytics providers;
- third-party databases.

Core reconciliation executes inside the deployed application.

Reviewer state is stored locally in the user's browser.

---

# Performance Characteristics

The hackathon implementation processes each organizer case in memory.

This is appropriate because:

- case sizes are small;
- reconciliation is interactive;
- no external I/O is required;
- deterministic computations complete quickly.

For substantially larger datasets, candidate indexing and batch-processing strategies could be introduced without changing the domain model.

---

# What Is Real vs Mocked

## Real implementation

The following are fully implemented:

- reference normalization;
- source profiling;
- fingerprint inference;
- settlement-fee detection;
- clock-offset detection;
- candidate generation;
- multi-signal scoring;
- duplicate/conflict handling;
- safe automatic matching;
- Needs Review classification;
- unmatched classification;
- Accept;
- Reject;
- Manual Pair;
- recomputation;
- financial totals;
- audit timeline;
- per-case reviewer persistence;
- active-case persistence.

---

## Mocked / constrained for the hackathon

Input comes from the organizer-provided JSON fixture rather than direct merchant integrations.

Reviewer state is browser-local rather than stored in a backend database.

There is no authentication or organization account system.

---

# Known Limitations

The current MVP:

- accepts the organizer JSON structure rather than arbitrary uploads;
- supports one browser-local reviewer state;
- does not provide shared multi-user reconciliation;
- does not persist historical reconciliation runs on a server;
- does not generate downloadable accounting reports;
- does not integrate directly with merchant POS systems;
- does not integrate directly with payment processors;
- does not include configurable business-specific matching policies;
- does not provide enterprise approval workflows.

---

# Production Roadmap

A production version of ReconFlow could evolve through several stages.

---

## Phase 1 — File ingestion

Support:

```text
CSV
XLSX
JSON
```

with configurable column mapping.

---

## Phase 2 — Persistent reconciliation runs

Add:

- PostgreSQL;
- saved reconciliation cases;
- persistent reviewer decisions;
- immutable audit logs.

---

## Phase 3 — Authentication and permissions

Add:

```text
Organization
├── Admin
├── Reconciliation Analyst
└── Approver
```

---

## Phase 4 — Integrations

Connect directly to:

- merchant POS systems;
- payment gateways;
- banks;
- settlement providers.

---

## Phase 5 — Configurable policy

Allow finance teams to configure:

```text
auto-match thresholds
allowed amount tolerance
clock tolerance
fee models
reference parsing rules
review escalation policies
```

---

## Phase 6 — Reconciliation analytics

Add:

- historical exception rates;
- fee drift detection;
- settlement-delay trends;
- provider performance;
- recurring mismatch analysis.

---

## Phase 7 — Assisted operations

An optional LLM layer could be added for tasks where language understanding adds value, such as:

- explaining complex exceptions in natural language;
- mapping unfamiliar uploaded spreadsheet columns;
- generating reconciliation summaries;
- assisting operator search.

The core financial matching decision would remain deterministic and auditable.

---

# Demo Walkthrough

A strong product demonstration can be completed in approximately 60–90 seconds.

---

## 1. Show the problem

Open **Source Data**.

Explain:

> The POS and settlement systems contain the same transactions, but reference formatting, amounts and timestamps do not line up directly.

---

## 2. Show learned behavior

Open **System Fingerprint**.

Explain:

> ReconFlow learns the relationship automatically. In this case, the settlement amount is approximately 97% of the POS amount, which means about a 3% settlement fee, and the settlement system clock is seven hours ahead.

---

## 3. Show safe automation

Open **Matched**.

Explain:

> ReconFlow combines semantic reference identity, fee-adjusted amount and corrected time to automatically clear high-confidence transactions.

---

## 4. Show safety intelligence

Open a `DUPLICATE_CONFLICT`.

Explain:

> These candidates can have extremely strong evidence, but two POS transactions compete for the same settlement record. ReconFlow refuses to automatically choose one because similarity alone is not enough for a safe financial decision.

---

## 5. Show human review

Click **Accept Pair**.

Explain:

> A reviewer can accept or reject the recommendation, and the entire reconciliation state and totals update immediately.

---

## 6. Show manual override

Open **Unmatched** and demonstrate **Manual Pair**.

Explain:

> When the engine cannot safely determine the relationship, the reviewer can explicitly create a manual pair. ReconFlow labels it as a manual override rather than pretending the algorithm was confident.

---

## 7. Show financial impact

Open **Financial Bridge**.

Explain:

> ReconFlow converts reconciliation results into operational financial impact: how much value is resolved, how much remains unresolved, and which exceptions need attention.

---

# Judge Summary

## 15-second version

> ReconFlow reconciles messy POS and settlement reports even when references, amounts and timestamps differ. It learns the settlement fee and clock offset automatically, combines multiple matching signals, auto-clears only safe matches and sends ambiguous cases to human review with clear explanations.

---

## 30-second version

> ReconFlow is a human-in-the-loop financial reconciliation engine. Instead of requiring exact references, amounts and timestamps, it learns how the POS and settlement systems differ. It normalizes references, learns fee and time-offset patterns, scores candidates using multiple signals and applies conservative safety rules. Safe matches are automated, uncertain matches are explained and sent to review, and every human decision immediately recalculates totals.

---

# Key Innovation

The main technical idea is not fuzzy matching.

It is:

```text
Learn system disagreement
        +
multi-signal evidence
        +
conflict-aware safety
        +
human override
        +
financial explainability
```

ReconFlow does not ask only:

> **Which records look similar?**

It asks:

> **Which records can be safely reconciled automatically, and which ones require human judgment?**

That distinction is especially important in financial systems.

---

# Reliability Checklist

The competition build has been validated through:

```text
EVENT guard               ✅
TypeScript typecheck      ✅
ESLint                     ✅
Vitest                     ✅
16/16 tests               ✅
All organizer cases       ✅
No-double-use invariant   ✅
Production Next.js build  ✅
Render health endpoint    ✅
Production API            ✅
Human review workflow     ✅
Case persistence          ✅
```

---

# Production

**Live Application**

https://lsh26-t022-p07.onrender.com

Production API marker:

```text
b2-competition
```

---

# Submission Build

Final application development progressed through:

```text
Build 0
→ Build 1 functional MVP
→ Build 2 competition build
→ active-case persistence hotfix
→ final submission documentation
```

The repository history preserves these milestones.

---

# License and Attribution

Third-party dependencies and their licenses are documented in:

```text
LICENSES.md
```

The primary project dependencies use permissive open-source licenses such as:

```text
MIT
ISC
Apache-2.0
```

The reconciliation fixture used by the application was supplied by the LofiStack Hackathon organizers.

No external commercial data source, hosted LLM API, stock-image library or third-party backend service is required by ReconFlow.

---

# Team

**Exps**

Team ID:

```text
LSH26-T022
```

Problem:

```text
P07 — Two-Source Sales Reconciliation Engine
```

Product:

```text
ReconFlow
```

---

## Final Product Statement

> **ReconFlow learns how two financial systems disagree, automatically reconciles only the transactions that are safe to clear, and gives humans clear evidence and control over everything else.**