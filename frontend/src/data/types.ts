export interface TrendPoint {
  day: string // ISO date
  value: number
}

export interface KpiData {
  revenue: number
  revenueDelta: number // vs previous period, %
  orders: number
  ordersDelta: number
  dau: number
  dauDelta: number
  conversionPct: number
  conversionDelta: number
  aov: number
  aovDelta: number
  revenueTrend: TrendPoint[] // 90 days
  dauTrend: TrendPoint[]
}

export interface FunnelStep {
  step: string
  sessions: number
  conversionPct: number // from top
  dropoffPct: number // from previous
}

export interface BreakdownSlice {
  label: string
  sessions: number
  dropped: number
}

export interface FunnelDropoffDetail {
  step: string
  devices: BreakdownSlice[]
  cities: BreakdownSlice[]
}

export interface CohortRow {
  cohort: string // "Jan 2026"
  size: number
  retention: (number | null)[] // pct by month offset, null = future
}

export interface DonutSlice {
  label: string
  value: number
}

export interface CustomerData {
  cohorts: CohortRow[]
  newVsReturning: DonutSlice[]
  trafficSources: DonutSlice[]
}

export interface ProductRow {
  id: string
  name: string
  category: string
  revenue: number
  units: number
  conversionPct: number
  trend: number[] // 12-week revenue sparkline
}

export interface ProductData {
  products: ProductRow[]
  categories: { name: string; revenue: number }[]
}
