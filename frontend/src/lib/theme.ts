// Sistema de paletas dinámicas. El color "brand" en Tailwind apunta a CSS variables
// que esta función actualiza en runtime. Permite cambiar la marca sin recompilar.

import type { PaletteKey } from '@/types/settings'

interface Palette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

// Paletas predefinidas — copiadas de Tailwind para mantener fidelidad visual.
export const PALETTES: Record<Exclude<PaletteKey, 'custom'>, Palette> = {
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
    400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
    800: '#3730a3', 900: '#312e81'
  },
  teal: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
    400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
    800: '#115e59', 900: '#134e4a'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
    800: '#9f1239', 900: '#881337'
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f'
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
    800: '#065f46', 900: '#064e3b'
  },
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
    800: '#1e293b', 900: '#0f172a'
  }
}

export interface PaletteOption {
  key: Exclude<PaletteKey, 'custom'>
  label: string
  swatch: string
}

export const PALETTE_OPTIONS: PaletteOption[] = [
  { key: 'indigo', label: 'Índigo (default)', swatch: PALETTES.indigo[500] },
  { key: 'teal', label: 'Teal', swatch: PALETTES.teal[500] },
  { key: 'rose', label: 'Rosa', swatch: PALETTES.rose[500] },
  { key: 'amber', label: 'Ámbar', swatch: PALETTES.amber[500] },
  { key: 'emerald', label: 'Esmeralda', swatch: PALETTES.emerald[500] },
  { key: 'slate', label: 'Pizarra', swatch: PALETTES.slate[500] }
]

/**
 * Genera una paleta tonal completa a partir de un único hex.
 * Mezcla con blanco para tonos claros y con negro para los oscuros.
 * No es perfecta perceptualmente pero da resultados muy decentes.
 */
export function paletteFromHex(hex: string): Palette {
  const base = hexToRgb(hex)
  if (!base) return PALETTES.indigo

  const mix = (target: { r: number; g: number; b: number }, ratio: number) => {
    const r = Math.round(base.r * (1 - ratio) + target.r * ratio)
    const g = Math.round(base.g * (1 - ratio) + target.g * ratio)
    const b = Math.round(base.b * (1 - ratio) + target.b * ratio)
    return rgbToHex(r, g, b)
  }
  const white = { r: 255, g: 255, b: 255 }
  const black = { r: 0, g: 0, b: 0 }

  return {
    50:  mix(white, 0.92),
    100: mix(white, 0.82),
    200: mix(white, 0.62),
    300: mix(white, 0.40),
    400: mix(white, 0.18),
    500: hex,
    600: mix(black, 0.18),
    700: mix(black, 0.32),
    800: mix(black, 0.48),
    900: mix(black, 0.62)
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Aplica la paleta indicada como CSS variables en :root.
 * Tailwind las consume vía la config (colors.brand[X] = 'var(--brand-X)').
 */
export function applyPalette(key: PaletteKey, customHex: string | null) {
  let palette: Palette
  if (key === 'custom' && customHex) {
    palette = paletteFromHex(customHex)
  } else if (key !== 'custom' && PALETTES[key]) {
    palette = PALETTES[key]
  } else {
    palette = PALETTES.indigo
  }

  const root = document.documentElement
  Object.entries(palette).forEach(([shade, value]) => {
    root.style.setProperty(`--brand-${shade}`, value)
  })
}
