# First Commit Checklist

Do not commit until all items below are true:

1. Replace `<START-CODE>` in `EVENT.md` with the real organizer-issued code.
2. Confirm repository-history declarations in `EVENT.md` are truthful.
3. Run `npm install` once to create `package-lock.json`.
4. Run:
   - `npm run check:event`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
5. Run `npm start`; verify `/`, `/healthz`, and `/api/reconcile`.
6. Inspect `git status` before the first commit.

`evaluation-manifest.json` is deliberately `{}` because the organizer schema/template has not been supplied in the project sources. Replace it with the official template as soon as you receive it; do not invent fields.
