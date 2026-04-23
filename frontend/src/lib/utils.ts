// Merges className strings. Filters out falsy values.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Format helpers reutilizables
export const formatCop = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(n))
}

export const formatCompact = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '0'
  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(n))
}
