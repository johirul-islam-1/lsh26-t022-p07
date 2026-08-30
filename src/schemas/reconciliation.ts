import { z } from 'zod'

export const transactionSchema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1),
  amount_bdt: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
})

export const reconciliationCaseSchema = z.object({
  case_id: z.string().min(1),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pos: z.array(transactionSchema),
  settlement: z.array(transactionSchema)
})

export const fixtureSchema = z.object({
  schema_version: z.string(),
  problem_id: z.literal('P07'),
  format_note: z.string().optional(),
  cases: z.array(reconciliationCaseSchema).min(1)
})

export const pairDecisionSchema = z.object({
  posId: z.string().min(1),
  settlementId: z.string().min(1)
})

export const reconcileRequestSchema = z.object({
  caseId: z.string().min(1),
  decisions: z.object({
    accepted: z.array(pairDecisionSchema).default([]),
    rejected: z.array(pairDecisionSchema).default([]),
    manual: z.array(pairDecisionSchema).default([])
  }).default({ accepted: [], rejected: [], manual: [] })
})

export type Transaction = z.infer<typeof transactionSchema>
export type ReconciliationCase = z.infer<typeof reconciliationCaseSchema>
export type ReconciliationFixture = z.infer<typeof fixtureSchema>
export type PairDecision = z.infer<typeof pairDecisionSchema>
export type ReconcileRequest = z.infer<typeof reconcileRequestSchema>
