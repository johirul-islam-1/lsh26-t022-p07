# ReconFlow Build 2 competition overlay

Apply this overlay only after Build 1 is committed, deployed, and stable.

## Included competition upgrades

- System Fingerprint learned-rule presentation + support meters.
- Visible exception reason codes and review priority.
- Stronger “Why not auto-matched?” presentation.
- Manual matches display as HUMAN/MANUAL OVERRIDE rather than misleading low confidence.
- Reviewer Accept / Reject / Manual audit timeline.
- Per-case localStorage resume of decisions + audit state.
- Reset demo state clears persisted reviewer state for the active case.
- Financial bridge and deterministic end-of-day summary.
- Active case ID shown directly in the reconciliation workspace.
- Build 2 insight regression tests, including every organizer case.

## Intentionally not included

- Database, auth, LLM, external API, worker, or new dependency.
- One-to-many grouped reconciliation (P3 stretch).
- Any EVENT.md, package.json, package-lock.json, Render, or CI replacement.

## Verification gate

```bash
npm run verify
npm start
curl http://localhost:3000/api/reconcile
```

Then manually verify one Accept, Reject, Manual Override, page refresh/resume, and Reset demo state.
