# ReconFlow — P07 Two-Source Sales Reconciliation Engine

**Team:** Exps  
**Team ID:** LSH26-T022  
**Problem:** P07 — Two-Source Sales Reconciliation Engine

**Live application:** https://lsh26-t022-p07.onrender.com

ReconFlow is an explainable deterministic reconciliation workflow for messy POS and settlement reports. It learns how two financial systems disagree, automatically clears only safe matches, explains uncertain records, and lets a human reviewer resolve the rest.

## Problem

Daily POS and settlement reports can disagree in predictable but messy ways:

- invoice references use different formats;
- settlement values can include processing fees;
- source clocks can be offset;
- transactions can cross midnight;
- duplicate references create ambiguity;
- records can exist in only one source.

A high similarity score alone is therefore not enough to safely reconcile financial records.

ReconFlow separates confident matches from genuine uncertainty and makes the reason for every exception visible.

## P07 Required Outcomes

| Requirement | ReconFlow implementation |
| --- | --- |
| Two messy datasets with at least 80 records each | Organizer-provided P07 POS and settlement cases with raw source views |
| Multi-signal reconciliation | Canonical reference identity + fee-adjusted amount + corrected-time evidence |
| Matched / Possible / Unmatched | Matched, Needs Review and Unmatched workflows with counts and monetary values |
| Human decisions affect reconciliation | Accept, Reject and Manual Pair trigger immediate recomputation |

## How It Works

ReconFlow uses a deterministic multi-pass reconciliation pipeline.

### 1. Validate and profile sources

The organizer case is validated and both source reports are profiled for:

- record counts;
- monetary totals;
- duplicate references;
- missing records;
- timestamp patterns;
- after-midnight transactions.

### 2. Canonicalize references

Different reference formats are converted into the same semantic identity.

Examples:

```text
INV-2026-069080
inv_2026_69080
2026069080
069080/2026/INV
```

All can resolve to the same canonical transaction key.

### 3. Learn the system fingerprint

Unique high-trust matches are used as seeds to infer how the two systems differ.

ReconFlow learns:

- dominant settlement fee;
- dominant POS-to-settlement clock offset;
- reference convention;
- strength/support of the learned rules.

For example, a case may reveal:

```text
Settlement ≈ POS × 0.9700
Time ≈ POS +7h
```

### 4. Score candidate pairs

Remaining candidate pairs are evaluated using three main signals:

1. semantic reference evidence;
2. agreement with the learned fee-adjusted amount;
3. agreement with the learned clock offset.

The default evidence weighting is:

```text
Reference: 45%
Amount:    35%
Time:      20%
```

### 5. Apply safety rules

A high score alone does not guarantee an automatic match.

ReconFlow also checks:

- reciprocal-best candidate selection;
- confidence threshold;
- score margin over competing candidates;
- duplicate conflicts;
- record reuse;
- unresolved ambiguity.

A pair is automatically cleared only when it passes these safety conditions.

Otherwise it is sent to **Needs Review**.

## Reconciliation Outcomes

ReconFlow separates records into three operational groups.

### Matched

High-confidence, conflict-free pairs that can be safely reconciled automatically.

### Needs Review

Plausible matches that are intentionally withheld from automatic reconciliation.

The interface explains why a pair was not automatically cleared.

Reason codes include:

```text
DUPLICATE_CONFLICT
MULTIPLE_PLAUSIBLE_MATCHES
AMOUNT_OUTLIER
TIME_OUTLIER
REFERENCE_PARSE_FAILURE
UNEXPLAINED
```

### Unmatched

Records with no acceptable counterpart.

Examples include:

```text
MISSING_POS
MISSING_SETTLEMENT
```

## Human Review

A reviewer can:

- **Accept** a proposed pair;
- **Reject** a proposed pair;
- **Manual Pair** an available POS record with an available settlement record.

Every decision triggers reconciliation again so counts and financial totals update immediately.

Manual matches are explicitly displayed as:

```text
MANUAL OVERRIDE
```

rather than being represented as algorithmic confidence.

## Persistence and Audit

Reviewer decisions are stored per case in browser `localStorage`.

The selected case is also persisted.

For example:

```text
Select PUB-04
→ refresh
→ PUB-04 remains active
```

Reviewer decisions for one case do not leak into another case.

The audit timeline records human actions such as:

```text
Accept
Reject
Manual Pair
```

along with the affected transaction pair.

**Reset Demo State** clears the reviewer state for the active case without changing the selected case.

## Competition Experience

The Build 2 interface includes:

- System Fingerprint;
- learned-rule support indicators;
- match-level evidence;
- “Why not auto-matched?” explanations;
- exception reason codes;
- review priority;
- Financial Bridge;
- deterministic end-of-day summary;
- human-action audit timeline;
- per-case browser persistence;
- raw Source Data views.

## Financial Bridge

ReconFlow translates matching results into financial impact rather than showing only record counts.

The interface surfaces information such as:

- matched gross value;
- matched settlement value;
- gross-to-net difference;
- unresolved POS value;
- automatic match count;
- human-accepted match count;
- manual override count;
- high-priority exceptions.

This helps an operator understand not only **which** transactions disagree, but also **how much money is still unresolved**.

## Architecture

```text
Browser
  |
  v
Next.js + React application
  |
  +-- /api/reconcile
  |
  +-- /healthz
  |
  v
Pure TypeScript reconciliation domain
  |
  +-- input validation
  +-- source profiling
  +-- reference canonicalization
  +-- high-trust seed discovery
  +-- fee/time fingerprint inference
  +-- multi-signal candidate scoring
  +-- duplicate/conflict handling
  +-- safe automatic matching
  +-- review/unmatched classification
  +-- human decisions
  +-- financial metrics
  +-- competition insights
```

Frontend and backend are served from one Render Web Service using a same-origin API.

## Technology

- Node.js
- Next.js 16
- React 19
- TypeScript
- Zod
- Tailwind CSS
- Radix UI Tabs
- Lucide React
- Vitest

ReconFlow does not require:

- a database;
- authentication;
- Redis;
- background workers;
- external APIs;
- an LLM;
- a vector database.

## Official Fixture

The application uses the organizer-provided fixture:

```text
src/data/P07_reconciliation_public.json
```

All 25 public cases are available:

```text
PUB-01 ... PUB-25
```

Money is converted internally to integer poisha before reconciliation calculations.

## Local Setup

Install dependencies:

```bash
npm ci
```

Run the complete verification gate:

```bash
npm run verify
```

Start the production server locally:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## API

Health check:

```bash
curl http://localhost:3000/healthz
```

List available reconciliation cases:

```bash
curl http://localhost:3000/api/reconcile
```

Run a clean reconciliation for PUB-01:

```bash
curl -X POST http://localhost:3000/api/reconcile \
  -H 'content-type: application/json' \
  -d '{"caseId":"PUB-01","decisions":{"accepted":[],"rejected":[],"manual":[]}}'
```

The deployed competition API identifies itself as:

```text
b2-competition
```

## Verification

`npm run verify` runs:

```text
EVENT.md guard
→ TypeScript typecheck
→ ESLint
→ Vitest
→ Next.js production build
```

The competition build contains automated tests covering:

- money conversion;
- reference canonicalization;
- candidate scoring;
- fingerprint inference;
- conflict detection;
- reconciliation;
- reviewer decisions;
- Build 2 financial/competition insights;
- all organizer public cases.

The all-case regression test also verifies that a record cannot be consumed more than once and that final record partitions remain internally consistent.

## Deployment

ReconFlow is deployed as one Render Web Service.

```text
Build command: npm ci && npm run build
Start command: npm start
Health path: /healthz
```

No secret environment variables are required for the MVP.

Live deployment:

```text
https://lsh26-t022-p07.onrender.com
```

## What Is Mocked

The reconciliation input is the organizer-provided public fixture rather than live merchant or payment-provider feeds.

There is no mocked reconciliation engine.

The following behavior is implemented and executed by the application:

- reference normalization;
- source profiling;
- fingerprint inference;
- fee detection;
- clock-offset detection;
- multi-signal scoring;
- duplicate/conflict handling;
- safe automatic matching;
- review classification;
- unmatched classification;
- Accept/Reject decisions;
- Manual Pair decisions;
- reconciliation recomputation;
- financial metrics.

Reviewer persistence is browser-local rather than backed by a shared database.

## Known Limitations

ReconFlow currently operates on the organizer-provided JSON cases instead of arbitrary CSV/XLSX uploads.

The learned fee and clock rules are deterministic case-level inferences rather than continuously trained machine-learning models.

Reviewer state is local to a single browser/device.

The MVP does not provide:

- authentication;
- multi-user collaboration;
- a persistent audit database;
- merchant/payment-provider integrations;
- report exports.

## What We Would Build Next

A production version would add:

- CSV/XLSX ingestion;
- configurable field mapping;
- persisted reconciliation runs;
- authenticated reviewer workflows;
- role-based approvals;
- exportable audit reports;
- configurable matching policies;
- merchant/POS integrations;
- payment-provider integrations;
- historical reconciliation analytics.

## Team

**Exps**  
Team ID: `LSH26-T022`  
Hackathon problem: `P07`