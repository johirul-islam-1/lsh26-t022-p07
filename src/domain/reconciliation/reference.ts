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

export function referenceEvidence(left: string, right: string): number {
  const a = canonicalizeReference(left)
  const b = canonicalizeReference(right)
  if (a && b) {
    if (a.key === b.key) return 1
    if (a.year !== b.year) return 0
    const similarity = normalizedSimilarity(String(a.invoice), String(b.invoice))
    if (similarity >= 0.83) return 0.8
    if (similarity >= 0.67) return 0.65
    return 0
  }

  const normalizedLeft = left.toLowerCase().replace(/[^a-z0-9]/g, '')
  const normalizedRight = right.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalizedSimilarity(normalizedLeft, normalizedRight) >= 0.8 ? 0.6 : 0
}

function normalizedSimilarity(left: string, right: string): number {
  const longest = Math.max(left.length, right.length)
  if (longest === 0) return 1
  return 1 - levenshtein(left, right) / longest
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row]
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        (current[column - 1] ?? 0) + 1,
        (previous[column] ?? 0) + 1,
        (previous[column - 1] ?? 0) + (left[row - 1] === right[column - 1] ? 0 : 1)
      )
    }
    previous.splice(0, previous.length, ...current)
  }
  return previous[right.length] ?? longestFallback(left, right)
}

function longestFallback(left: string, right: string): number {
  return Math.max(left.length, right.length)
}
