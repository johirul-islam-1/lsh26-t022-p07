# ReconFlow — P07 Two-Source Sales Reconciliation Engine

ReconFlow is an explainable deterministic reconciliation workflow for messy POS and settlement reports.

## Build state

**Build 0 foundation.** The matcher is intentionally not claimed yet.

Implemented now:
- organizer P07 fixture validation with Zod;
- all 25 public cases selectable;
- integer-poisha money conversion;
- semantic reference canonicalization primitive;
- source profiling (counts, totals, duplicates, after-midnight rows);
- locked `/api/reconcile` same-origin boundary;
- `/healthz`;
- Next.js UI shell with Matched / Needs Review / Unmatched / Source Data workflow slots;
- CI and Render configuration.

Build 1 adds the real multi-pass matcher, fingerprint inference, conflict handling and human decisions.

## Local setup

```bash
npm install
npm run check:event
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Then open `http://localhost:3000`.

Smoke checks:

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/api/reconcile
curl -X POST http://localhost:3000/api/reconcile \
  -H 'content-type: application/json' \
  -d '{"caseId":"PUB-01","decisions":{"accepted":[],"rejected":[],"manual":[]}}'
```

## Deployment

One Render Web Service:
- Build: `npm ci && npm run build`
- Start: `npm start`
- Health: `/healthz`
- No secrets required for MVP.

## Fixture

`src/data/P07_reconciliation_public.json` is the organizer-provided public fixture and is preserved at the external input boundary.

## Evaluation manifest

The project sources provided so far do not include the organizer's exact `evaluation-manifest.json` schema. The Build 0 file is intentionally `{}` rather than inventing fields. Replace it with the official template as soon as supplied.
