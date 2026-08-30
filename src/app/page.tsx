import fixtureRaw from '@/data/P07_reconciliation_public.json'
import { Dashboard } from '@/features/reconciliation/Dashboard'
import { fixtureSchema } from '@/schemas/reconciliation'

export default function HomePage() {
  const fixture = fixtureSchema.parse(fixtureRaw)
  return <Dashboard caseIds={fixture.cases.map((item) => item.case_id)} schemaVersion={fixture.schema_version} />
}
