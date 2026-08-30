import type { PairDecision } from '@/schemas/reconciliation'
import type { ReconciliationResult } from '@/domain/reconciliation/types'

export type AuditAction = 'ACCEPT' | 'REJECT' | 'MANUAL'

const ACTIVE_CASE_STORAGE_KEY = 'reconflow:p07:b2:active-case'

export function readSavedCaseId(caseIds: string[]): string | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.localStorage.getItem(ACTIVE_CASE_STORAGE_KEY)
    return saved && caseIds.includes(saved) ? saved : null
  } catch {
    return null
  }
}

export function writeSavedCaseId(caseId: string): void {
  if (typeof window === 'undefined' || !caseId) return
  try {
    window.localStorage.setItem(ACTIVE_CASE_STORAGE_KEY, caseId)
  } catch {
    // Storage can be disabled. The active case still works in memory.
  }
}

export interface AuditEntry {
  id: string
  action: AuditAction
  pair: PairDecision
  createdAt: string
}

export interface SavedReviewState {
  version: 1
  decisions: ReconciliationResult['decisions']
  audit: AuditEntry[]
}

export function createAuditEntry(action: AuditAction, pair: PairDecision): AuditEntry {
  return {
    id: `${Date.now().toString(36)}-${pair.posId}-${pair.settlementId}-${action}`,
    action,
    pair,
    createdAt: new Date().toISOString()
  }
}

export function storageKey(caseId: string): string {
  return `reconflow:p07:b2:${caseId}`
}

export function readSavedReviewState(caseId: string): SavedReviewState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(caseId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SavedReviewState>
    if (parsed.version !== 1 || !parsed.decisions || !Array.isArray(parsed.audit)) return null
    return parsed as SavedReviewState
  } catch {
    return null
  }
}

export function writeSavedReviewState(caseId: string, state: SavedReviewState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(caseId), JSON.stringify(state))
  } catch {
    // Storage can be disabled. Reconciliation remains fully functional in memory.
  }
}

export function clearSavedReviewState(caseId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(caseId))
  } catch {
    // Ignore storage failures; reset still succeeds in memory.
  }
}
