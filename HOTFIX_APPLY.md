# P07 Build 2 hotfix — persist active case

Fixes the production UX bug where refreshing while viewing PUB-04 (or any non-default case) returned the dashboard to PUB-01.

Behavior after patch:
- active case is stored under `reconflow:p07:b2:active-case`
- only case IDs present in the organizer fixture are restored
- first reconciliation waits until active-case restoration completes
- per-case decisions and audit history continue to use their existing independent storage keys
- Reset demo state clears reviewer state for the active case but does not unexpectedly navigate to PUB-01

Apply on `fix/persist-active-case`, run `npm run verify`, then runtime-test case refresh persistence before merging.
