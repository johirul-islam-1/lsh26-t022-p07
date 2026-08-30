export function hasCompetingCandidate(ids: string[]): boolean {
  return new Set(ids).size < ids.length
}
