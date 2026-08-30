import type { Money } from './types'

export function parseBdtToPoisha(value: string): Money {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error(`Invalid BDT amount: ${value}`)
  const [whole, fractional = ''] = value.split('.')
  const poisha = Number(whole) * 100 + Number(fractional.padEnd(2, '0'))
  if (!Number.isSafeInteger(poisha)) throw new Error(`BDT amount is outside safe range: ${value}`)
  return poisha
}

export function formatBdt(value: Money): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100)
}
