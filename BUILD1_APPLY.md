# P07 Build 1 — Functional MVP Patch

Apply this ZIP **on top of the already verified official P07 repository**. It intentionally does not contain `EVENT.md`, `package.json`, `package-lock.json`, Render config, or CI config, so it cannot overwrite the event start record or the dependency fixes already verified in Build 0.

## Branch

```bash
git checkout main
git pull --ff-only origin main
git checkout -b build/functional-mvp
```

Extract the ZIP into the repository root, preserving paths and overwriting changed files.

## Verify

```bash
npm run verify
npm start
```

Then smoke-test:

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/api/reconcile
curl -X POST http://localhost:3000/api/reconcile \
  -H 'content-type: application/json' \
  -d '{"caseId":"PUB-01","decisions":{"accepted":[],"rejected":[],"manual":[]}}'
```

Judge-visible checks:

1. Source Data shows >=80 POS and settlement rows.
2. Fingerprint shows learned fee + clock shift.
3. Matched / Needs Review / Unmatched all show real records/counts/values.
4. Accept and Reject a review candidate and confirm immediate recomputation.
5. Manual-pair one unmatched POS + settlement and confirm immediate recomputation.

Do not merge to `main` until verification is green.

## Expected PUB-01 baseline from the Build 1 engine

Before reviewer decisions, the current deterministic engine smoke-test produces:

```text
matched: 89
review: 5
unmatched POS: 3
unmatched settlement: 6
learned settlement fee: 3.00%
learned clock shift: +420 minutes (+7h)
```

If your local output differs materially, stop before merging and send the exact API response / test failure.
