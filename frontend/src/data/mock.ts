import type {
  KpiData,
  FunnelStep,
  FunnelDropoffDetail,
  CustomerData,
  ProductData,
  TrendPoint,
} from './types'

// Deterministic PRNG so the dashboard renders the same story on every load.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260718)

const TODAY = new Date('2026-07-18T00:00:00Z')

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

function genTrend(days: number, base: number, growth: number, noise: number, weekly = 0.18): TrendPoint[] {
  const out: TrendPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - 1 - i) / days
    const d = new Date(TODAY)
    d.setUTCDate(d.getUTCDate() - i)
    const dow = d.getUTCDay()
    const weekend = dow === 0 || dow === 6 ? 1 - weekly : 1 + weekly * 0.35
    const value = base * (1 + growth * t) * weekend * (1 + (rand() - 0.5) * noise)
    out.push({ day: daysAgo(i), value: Math.round(value) })
  }
  return out
}

function sum(points: TrendPoint[], lastN: number): number {
  return points.slice(-lastN).reduce((acc, p) => acc + p.value, 0)
}

const revenueTrend = genTrend(90, 38_000, 0.55, 0.22)
const dauTrend = genTrend(90, 11_200, 0.4, 0.14)

const rev30 = sum(revenueTrend, 30)
const revPrev30 = sum(revenueTrend.slice(0, -30), 30)
const dau = dauTrend[dauTrend.length - 1].value
const dauPrev = dauTrend[dauTrend.length - 31].value

export const kpiData: KpiData = {
  revenue: rev30,
  revenueDelta: ((rev30 - revPrev30) / revPrev30) * 100,
  orders: 28_461,
  ordersDelta: 9.4,
  dau,
  dauDelta: ((dau - dauPrev) / dauPrev) * 100,
  conversionPct: 3.42,
  conversionDelta: 0.31,
  aov: rev30 / 28_461,
  aovDelta: 2.6,
  revenueTrend,
  dauTrend,
}

const funnelCounts = [148_320, 112_540, 94_780, 41_260, 27_930, 22_410, 19_870]
const funnelSteps = ['Landing', 'Search', 'Product View', 'Add to Cart', 'Checkout', 'Payment', 'Purchase']

export const funnelData: FunnelStep[] = funnelCounts.map((sessions, i) => ({
  step: funnelSteps[i],
  sessions,
  conversionPct: (sessions / funnelCounts[0]) * 100,
  dropoffPct: i === 0 ? 0 : (1 - sessions / funnelCounts[i - 1]) * 100,
}))

const devices = ['Mobile', 'Desktop', 'Tablet']
const cities = ['New York', 'London', 'Bengaluru', 'Berlin', 'Singapore', 'São Paulo']

export const funnelDropoffs: FunnelDropoffDetail[] = funnelSteps.map((step, i) => {
  const dropped = i === 0 ? 0 : funnelCounts[i - 1] - funnelCounts[i]
  const devSplit = [0.58, 0.33, 0.09]
  const citySplit = [0.27, 0.21, 0.18, 0.14, 0.11, 0.09]
  return {
    step,
    devices: devices.map((label, j) => ({
      label,
      sessions: Math.round(funnelCounts[i] * devSplit[j]),
      dropped: Math.round(dropped * (devSplit[j] + (j === 0 ? 0.07 : j === 1 ? -0.05 : -0.02))),
    })),
    cities: cities.map((label, j) => ({
      label,
      sessions: Math.round(funnelCounts[i] * citySplit[j]),
      dropped: Math.round(dropped * citySplit[j] * (1 + (rand() - 0.5) * 0.3)),
    })),
  }
})

const cohortMonths = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']

export const customerData: CustomerData = {
  cohorts: cohortMonths.map((cohort, ci) => {
    const size = Math.round(3_000 + rand() * 4_500 + ci * 320)
    const maxOffset = cohortMonths.length - 1 - ci
    const retention: (number | null)[] = []
    let r = 100
    for (let m = 0; m <= 9; m++) {
      if (m > maxOffset) {
        retention.push(null)
        continue
      }
      if (m === 0) {
        retention.push(100)
        continue
      }
      // steeper early decay, flattening tail; later cohorts retain slightly better
      const decay = m === 1 ? 0.42 + rand() * 0.08 - ci * 0.008 : 0.82 + rand() * 0.1
      r = r * decay
      retention.push(Math.round(r * 10) / 10)
    }
    return { cohort, size, retention }
  }),
  newVsReturning: [
    { label: 'New', value: 41_800 },
    { label: 'Returning', value: 68_300 },
  ],
  trafficSources: [
    { label: 'Organic', value: 38_400 },
    { label: 'Paid', value: 24_100 },
    { label: 'Referral', value: 17_600 },
    { label: 'Direct', value: 30_000 },
  ],
}

const productNames: [string, string][] = [
  ['Atlas Pro Subscription', 'Subscriptions'],
  ['Nimbus Cloud Storage', 'Infrastructure'],
  ['Pulse API Credits', 'Developer'],
  ['Vertex Analytics Suite', 'Analytics'],
  ['Orbit Team Seats', 'Subscriptions'],
  ['Quartz Data Export', 'Analytics'],
  ['Helix Automation Pack', 'Automation'],
  ['Drift Session Replay', 'Analytics'],
  ['Beacon Alerts Add-on', 'Developer'],
  ['Summit Priority Support', 'Services'],
  ['Ember Email Digests', 'Automation'],
  ['Slate Whiteboard', 'Collaboration'],
]

export const productData: ProductData = {
  products: productNames.map(([name, category], i) => {
    const base = 240_000 * Math.pow(0.82, i) * (0.9 + rand() * 0.2)
    const trend = Array.from({ length: 12 }, (_, w) => {
      const dir = i % 3 === 0 ? 1 : i % 3 === 1 ? -0.4 : 0.3
      return Math.round((base / 12) * (1 + (dir * w) / 24 + (rand() - 0.5) * 0.3))
    })
    return {
      id: `p${i + 1}`,
      name,
      category,
      revenue: Math.round(base),
      units: Math.round(base / (18 + rand() * 60)),
      conversionPct: Math.round((1.2 + rand() * 4.8) * 100) / 100,
      trend,
    }
  }),
  categories: [
    { name: 'Subscriptions', revenue: 402_000 },
    { name: 'Analytics', revenue: 297_000 },
    { name: 'Infrastructure', revenue: 187_000 },
    { name: 'Developer', revenue: 121_000 },
    { name: 'Automation', revenue: 84_000 },
    { name: 'Services', revenue: 52_000 },
  ],
}
