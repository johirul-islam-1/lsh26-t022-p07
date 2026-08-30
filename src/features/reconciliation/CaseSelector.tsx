export function CaseSelector({ caseIds, value, onChange }: { caseIds: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <label className="case-picker">
      <span>Demo case</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {caseIds.map((id) => <option key={id} value={id}>{id}</option>)}
      </select>
    </label>
  )
}
