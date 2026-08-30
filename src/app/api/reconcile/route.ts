import { NextResponse } from 'next/server'
import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { reconcile } from '@/domain/reconciliation/reconcile'
import { fixtureSchema, reconcileRequestSchema } from '@/schemas/reconciliation'

const fixture = fixtureSchema.parse(fixtureRaw)

export async function GET() {
  return NextResponse.json({
    team: 'Exps',
    teamId: 'LSH26-T022',
    problemId: 'P07',
    build: 'b1-functional-mvp',
    caseIds: fixture.cases.map((item) => item.case_id)
  })
}

export async function POST(request: Request) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = reconcileRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reconciliation request.', issues: parsed.error.issues }, { status: 400 })
  }

  const selected = fixture.cases.find((item) => item.case_id === parsed.data.caseId)
  if (!selected) return NextResponse.json({ error: 'Unknown caseId.' }, { status: 404 })

  return NextResponse.json(reconcile(selected, parsed.data))
}
