# ReconFlow Architecture — Build 0

This repository follows the locked P07 topology:

Browser → Next.js → `/api/reconcile` → pure TypeScript reconciliation domain → typed response.

`/healthz` is served by the same Next.js application and the same Render Web Service.

Build 0 intentionally implements only schema validation, source profiling, integer-poisha money handling, canonical reference primitives, API contracts, UI workflow slots, CI and deployment configuration. It does **not** claim to implement the final matcher.

Build 1 fills the existing domain seams in this order: canonical references → unique seed discovery → fee/time fingerprint → multi-signal candidates → conflict safety → matched/review/unmatched → human decisions → full recomputation.
