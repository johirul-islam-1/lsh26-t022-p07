# P07 Build Lock Summary

Product: ReconFlow

Required judge-visible outcomes:
1. Two organizer-provided messy datasets with >=80 rows each.
2. Multi-signal reconciliation: semantic reference + fee-adjusted amount + corrected time.
3. Matched / Possible / Unmatched counts and values.
4. Accept / Reject / Manual Pair immediately recompute truth.

Architecture: Next.js + React + TypeScript + Node + Zod, one Render Web Service, no DB/auth/LLM/external API.

Build 0 is foundation only. Build 1 must deliver all 4 outcomes.
