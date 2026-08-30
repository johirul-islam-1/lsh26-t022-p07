import type { CanonicalReference, ReferenceStyle } from './types'

const YEAR_RE = /(?:19|20)\d{2}/

export function canonicalizeReference(reference: string): CanonicalReference | null {
  const normalized = reference.trim().toLowerCase()
  const yearMatch = normalized.match(YEAR_RE)
  if (!yearMatch) return null
  const year = Number(yearMatch[0])

  const withoutYear = normalized.replace(yearMatch[0], ' ')
  const digitParts = withoutYear.match(/\d+/g) ?? []
  if (digitParts.length === 0) {
    // digits-only style such as 2026361299: split year prefix from invoice remainder.
    const digits = normalized.replace(/\D/g, '')
    if (!digits.startsWith(String(year)) || digits.length <= 4) return null
    const invoice = Number(digits.slice(4))
    return Number.isSafeInteger(invoice) ? { year, invoice, key: `${year}:${invoice}` } : null
  }

  const invoice = Number(digitParts.join(''))
  if (!Number.isSafeInteger(invoice)) return null
  return { year, invoice, key: `${year}:${invoice}` }
}

export function detectReferenceStyle(references: string[]): ReferenceStyle {
  if (references.length === 0) return 'mixed'
  if (references.every((ref) => /^\d+$/.test(ref))) return 'digits'
  if (references.every((ref) => /^inv_/i.test(ref))) return 'lowercase'
  if (references.every((ref) => /\/inv$/i.test(ref))) return 'suffixed'
  return 'mixed'
}

export function canonicalReferencePreview(reference: string): string {
  const parsed = canonicalizeReference(reference)
  return parsed ? parsed.key : 'unparsed'
}
