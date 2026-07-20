export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return Math.round(n).toLocaleString()
}

export function money(n: number): string {
  return `$${compact(n)}`
}

export function moneyFull(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}

export function shortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function monthLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
