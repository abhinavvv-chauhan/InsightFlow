import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, MousePointerClick, ShoppingCart, Receipt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SpotlightCard } from '../components/ui/SpotlightCard'
import { Ticker } from '../components/ui/Ticker'
import { Delta } from '../components/ui/Delta'
import { CountUp } from '../components/ui/CountUp'
import { Skeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { EChart } from '../components/charts/EChart'
import { pageStagger } from '../components/ui/motion'
import { useAsync } from '../hooks/useAsync'
import { api } from '../data/api'
import { accent, ink, chartFont, monoFont, tooltipCss } from '../lib/palette'
import { compact, money, moneyFull, pct, shortDate } from '../lib/format'
import type { KpiData } from '../data/types'

export function Executive() {
  const { data, loading } = useAsync(() => api.kpi())
  return (
    <>
      <PageHeader
        title="Executive Hub"
        subtitle="Live topline metrics · last 30 days vs previous 30"
        actions={<LivePill />}
      />
      <motion.div
        variants={pageStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6 xl:grid-cols-12"
      >
        {/* row 1 — hero revenue tile + DAU + conversion */}
        <HeroTile data={data} loading={loading} />
        <StatTile
          className="col-span-1 lg:col-span-2 xl:col-span-3"
          icon={Users}
          label="Daily active users"
          loading={loading}
          value={data?.dau}
          delta={data?.dauDelta}
          format={compact}
        />
        <StatTile
          className="col-span-1 lg:col-span-2 xl:col-span-3"
          icon={MousePointerClick}
          label="Conversion rate"
          loading={loading}
          value={data?.conversionPct}
          delta={data?.conversionDelta}
          deltaSuffix="pt"
          format={(n) => pct(n, 2)}
        />
        {/* row 2 — orders + AOV + big trend chart */}
        <StatTile
          className="col-span-1 lg:col-span-2 xl:col-span-3"
          icon={ShoppingCart}
          label="Orders"
          loading={loading}
          value={data?.orders}
          delta={data?.ordersDelta}
          format={compact}
        />
        <StatTile
          className="col-span-1 lg:col-span-2 xl:col-span-3"
          icon={Receipt}
          label="Average order value"
          loading={loading}
          value={data?.aov}
          delta={data?.aovDelta}
          format={(n) => `$${n.toFixed(2)}`}
        />
        <RevenueTrendCard data={data} loading={loading} />
        <DauCard data={data} loading={loading} />
      </motion.div>
    </>
  )
}

function LivePill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-soft">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald" />
      </span>
      Live
    </span>
  )
}

/* ── Hero: 30-day revenue with slot-machine ticker that re-rolls ── */
function HeroTile({ data, loading }: { data: KpiData | null; loading: boolean }) {
  // simulate live updates: nudge revenue every few seconds so the ticker flips
  const [liveRevenue, setLiveRevenue] = useState<number | null>(null)
  useEffect(() => {
    if (!data) return
    setLiveRevenue(data.revenue)
    const id = setInterval(() => {
      setLiveRevenue((r) => (r == null ? r : r + Math.round(120 + Math.random() * 900)))
    }, 3200)
    return () => clearInterval(id)
  }, [data])

  return (
    <SpotlightCard className="col-span-2 p-5 sm:p-6 lg:col-span-6 xl:col-span-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <DollarSign className="size-4 text-amber" />
          Revenue · 30 days
        </div>
        {data && <Delta value={data.revenueDelta} />}
      </div>
      {loading || liveRevenue == null ? (
        <Skeleton className="mt-4 h-14 w-64" />
      ) : (
        <div className="mt-3 font-mono text-4xl font-semibold tracking-tight text-ink-primary sm:text-5xl">
          <Ticker value={moneyFull(liveRevenue)} />
        </div>
      )}
      <p className="mt-2 text-xs text-ink-muted">
        Updating in real time · {data ? `${compact(data.orders)} orders` : '—'}
      </p>
      {data && <MiniArea trend={data.revenueTrend.slice(-30)} />}
    </SpotlightCard>
  )
}

function MiniArea({ trend }: { trend: { day: string; value: number }[] }) {
  const option = useMemo(
    () => ({
      grid: { left: 0, right: 0, top: 6, bottom: 0 },
      xAxis: { type: 'category', show: false, data: trend.map((t) => t.day) },
      yAxis: { type: 'value', show: false, min: 'dataMin' },
      series: [
        {
          type: 'line',
          data: trend.map((t) => t.value),
          smooth: 0.35,
          symbol: 'none',
          lineStyle: { width: 2, color: accent.amber },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245,158,11,0.18)' },
                { offset: 1, color: 'rgba(245,158,11,0)' },
              ],
            },
          },
          animationDuration: 1200,
          animationEasing: 'cubicOut' as const,
        },
      ],
    }),
    [trend],
  )
  return <EChart option={option} height={72} className="mt-4" />
}

/* ── Generic bento stat tile with count-up ── */
function StatTile({
  icon: Icon,
  label,
  value,
  delta,
  deltaSuffix = '%',
  format,
  loading,
  className,
}: {
  icon: LucideIcon
  label: string
  value?: number
  delta?: number
  deltaSuffix?: string
  format: (n: number) => string
  loading: boolean
  className?: string
}) {
  return (
    <SpotlightCard className={`p-5 ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <Icon className="size-4 text-emerald-soft" />
          {label}
        </div>
        {delta !== undefined && <Delta value={delta} suffix={deltaSuffix} />}
      </div>
      {loading || value === undefined ? (
        <Skeleton className="mt-4 h-9 w-28" />
      ) : (
        <div className="mt-3 font-mono text-3xl font-semibold tracking-tight">
          <CountUp value={value} format={format} />
        </div>
      )}
    </SpotlightCard>
  )
}

/* ── Revenue trend with crosshair tooltip + brush zoom ── */
function RevenueTrendCard({ data, loading }: { data: KpiData | null; loading: boolean }) {
  const option = useMemo(() => {
    if (!data) return {}
    const days = data.revenueTrend.map((t) => t.day)
    return {
      textStyle: { fontFamily: chartFont },
      grid: { left: 52, right: 16, top: 24, bottom: 44 },
      xAxis: {
        type: 'category',
        data: days,
        boundaryGap: false,
        axisLine: { lineStyle: { color: ink.axis } },
        axisTick: { show: false },
        axisLabel: { color: ink.muted, formatter: (v: string) => shortDate(v), hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: ink.grid } },
        axisLabel: { color: ink.muted, fontFamily: monoFont, formatter: (v: number) => money(v) },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: 'rgba(245,158,11,0.45)', width: 1 },
          snap: true,
        },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: tooltipCss,
        formatter: (params: unknown) => {
          const p = (params as { axisValue: string; value: number }[])[0]
          const el = document.createElement('div')
          const date = document.createElement('div')
          date.style.cssText = `color:${ink.secondary};font-size:11px;margin-bottom:4px;font-family:${chartFont}`
          date.textContent = new Date(p.axisValue).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
          })
          const val = document.createElement('div')
          val.style.cssText = `color:${ink.primary};font-size:16px;font-weight:600;font-family:${monoFont}`
          val.textContent = moneyFull(p.value)
          const key = document.createElement('div')
          key.style.cssText = `display:flex;align-items:center;gap:6px;color:${ink.secondary};font-size:11px;margin-top:3px`
          const stroke = document.createElement('span')
          stroke.style.cssText = `display:inline-block;width:12px;height:2px;border-radius:1px;background:${accent.amber}`
          key.append(stroke, document.createTextNode('Revenue'))
          el.append(date, val, key)
          return el
        },
      },
      dataZoom: [
        { type: 'inside', throttle: 50 },
        {
          type: 'slider',
          height: 26,
          bottom: 8,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.02)',
          fillerColor: 'rgba(245,158,11,0.08)',
          handleStyle: { color: accent.amber, borderColor: accent.amber },
          moveHandleStyle: { color: 'rgba(255,255,255,0.18)' },
          dataBackground: {
            lineStyle: { color: 'rgba(255,255,255,0.16)' },
            areaStyle: { color: 'rgba(255,255,255,0.05)' },
          },
          selectedDataBackground: {
            lineStyle: { color: accent.amber },
            areaStyle: { color: 'rgba(245,158,11,0.12)' },
          },
          textStyle: { color: ink.muted, fontFamily: monoFont },
        },
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          data: data.revenueTrend.map((t) => t.value),
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          itemStyle: { color: accent.amber, borderColor: '#121212', borderWidth: 2 },
          lineStyle: { width: 2, color: accent.amber },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245,158,11,0.16)' },
                { offset: 1, color: 'rgba(245,158,11,0)' },
              ],
            },
          },
          emphasis: { scale: 1.4 },
          animationDuration: 1400,
          animationEasing: 'cubicOut' as const,
        },
      ],
    }
  }, [data])

  return (
    <SpotlightCard interactive={false} className="col-span-2 p-5 sm:p-6 lg:col-span-6 xl:col-span-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Revenue trend</h2>
          <p className="text-xs text-ink-muted">90 days · drag the slider or scroll to zoom</p>
        </div>
      </div>
      {loading ? <ChartSkeleton height={320} /> : <EChart option={option} height={320} />}
    </SpotlightCard>
  )
}

/* ── DAU column chart ── */
function DauCard({ data, loading }: { data: KpiData | null; loading: boolean }) {
  const option = useMemo(() => {
    if (!data) return {}
    const last14 = data.dauTrend.slice(-14)
    return {
      textStyle: { fontFamily: chartFont },
      grid: { left: 44, right: 8, top: 24, bottom: 28 },
      xAxis: {
        type: 'category',
        data: last14.map((t) => t.day),
        axisLine: { lineStyle: { color: ink.axis } },
        axisTick: { show: false },
        axisLabel: { color: ink.muted, formatter: (v: string) => shortDate(v), interval: 3 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: ink.grid } },
        axisLabel: { color: ink.muted, fontFamily: monoFont, formatter: (v: number) => compact(v) },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(255,255,255,0.04)' } },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: tooltipCss,
        formatter: (params: unknown) => {
          const p = (params as { axisValue: string; value: number }[])[0]
          const el = document.createElement('div')
          const date = document.createElement('div')
          date.style.cssText = `color:${ink.secondary};font-size:11px;margin-bottom:3px`
          date.textContent = shortDate(p.axisValue)
          const val = document.createElement('div')
          val.style.cssText = `color:${ink.primary};font-size:15px;font-weight:600;font-family:${monoFont}`
          val.textContent = `${p.value.toLocaleString()} users`
          el.append(date, val)
          return el
        },
      },
      series: [
        {
          name: 'DAU',
          type: 'bar',
          data: last14.map((t) => t.value),
          barMaxWidth: 20,
          itemStyle: { color: accent.emerald, borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: accent.emeraldSoft } },
          animationDelay: (idx: number) => idx * 45,
          animationEasing: 'elasticOut' as const,
          animationDuration: 900,
        },
      ],
    }
  }, [data])

  return (
    <SpotlightCard interactive={false} className="col-span-2 p-5 sm:p-6 lg:col-span-6 xl:col-span-4">
      <h2 className="text-sm font-semibold">Daily active users</h2>
      <p className="mb-2 text-xs text-ink-muted">Last 14 days</p>
      {loading ? <ChartSkeleton height={320} /> : <EChart option={option} height={320} />}
    </SpotlightCard>
  )
}
