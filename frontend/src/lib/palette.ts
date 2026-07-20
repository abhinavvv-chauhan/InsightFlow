/**
 * Obsidian & Amber palette — every value validated against the dark surface
 * #121212 with the dataviz six-checks validator (lightness band, chroma floor,
 * CVD ΔE ≥ 8 adjacent, normal-vision ΔE ≥ 15, contrast ≥ 3:1).
 */

export const surface = {
  page: '#0A0A0A',
  card: '#121212',
  raised: '#1C1C1C',
} as const

export const ink = {
  primary: '#F5F5F2',
  secondary: '#A6A5A0',
  muted: '#6E6D68',
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.14)',
} as const

export const accent = {
  amber: '#F59E0B',
  amberSoft: '#FBBF24',
  emerald: '#10B981',
  emeraldSoft: '#34D399',
} as const

/** Categorical slots, fixed order — never cycled, never re-ordered per chart. */
export const series = [
  '#0A8A5F', // emerald
  '#DC2626', // red
  '#0D9488', // teal
  '#D97706', // amber
  '#DB2777', // rose
  '#65A30D', // lime
] as const

/** Ordinal amber ramp (single hue, monotone lightness) — funnel stages, light→dark. */
export const ordinalAmber = [
  '#ffc47f',
  '#f0ab55',
  '#dd9225',
  '#c87b00',
  '#ae6800',
  '#915700',
  '#754700',
] as const

/** Sequential emerald ramp — retention heatmap. Low values recede to surface. */
export const sequentialEmerald = [
  '#0B3B2E',
  '#0C4F3B',
  '#0A6449',
  '#0A8A5F',
  '#10B981',
  '#34D399',
  '#6EE7B7',
] as const

/** Interpolate the sequential ramp for a 0..1 value. */
export function emeraldAt(t: number): string {
  const ramp = sequentialEmerald
  const clamped = Math.max(0, Math.min(1, t))
  const pos = clamped * (ramp.length - 1)
  const i = Math.floor(pos)
  const frac = pos - i
  if (i >= ramp.length - 1) return ramp[ramp.length - 1]
  return mixHex(ramp[i], ramp[i + 1], frac)
}

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (shift: number) => {
    const va = (pa >> shift) & 0xff
    const vb = (pb >> shift) & 0xff
    return Math.round(va + (vb - va) * t)
  }
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

export const chartFont = 'Outfit, system-ui, sans-serif'
export const monoFont = '"Space Grotesk", ui-monospace, monospace'

export const tooltipCss = [
  'background: rgba(18,18,18,0.78)',
  'backdrop-filter: blur(14px)',
  '-webkit-backdrop-filter: blur(14px)',
  'border: 1px solid rgba(255,255,255,0.09)',
  'border-radius: 12px',
  'box-shadow: 0 12px 40px -12px rgba(0,0,0,0.8)',
  'padding: 10px 12px',
].join(';')
