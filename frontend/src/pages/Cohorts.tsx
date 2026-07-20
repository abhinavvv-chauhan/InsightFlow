import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/layout/PageHeader'
import { SpotlightCard } from '../components/ui/SpotlightCard'
import { Skeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { EChart } from '../components/charts/EChart'
import { pageStagger } from '../components/ui/motion'
import { useAsync } from '../hooks/useAsync'
import { api } from '../data/api'
import { emeraldAt, series, ink, chartFont, monoFont, tooltipCss } from '../lib/palette'
import { compact, pct } from '../lib/format'
import type { CohortRow, DonutSlice } from '../data/types'

export function Cohorts() {
  const { data, loading } = useAsync(() => api.customer())
  return (
    <>
      <PageHeader
        title="Customer Cohorts"
        subtitle="Monthly retention by signup cohort · demographics at a glance"
      />
      <motion.div variants={pageStagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SpotlightCard interactive={false} className="p-5 sm:p-6 xl:col-span-2">
          <h2 className="text-sm font-semibold">Retention heatmap</h2>
          <p className="mb-4 text-xs text-ink-muted">
            % of each cohort still active by month offset · hover to trace row & column
          </p>
          {loading || !data ? <HeatmapSkeleton /> : <RetentionHeatmap cohorts={data.cohorts} />}
        </SpotlightCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <SpotlightCard interactive={false} className="p-5">
            <h2 className="text-sm font-semibold">New vs returning</h2>
            <p className="mb-1 text-xs text-ink-muted">Active users · 30 days</p>
            {loading || !data ? <ChartSkeleton height={210} /> : (
              <Donut slices={data.newVsReturning} colors={[series[3], series[0]]} />
            )}
          </SpotlightCard>
          <SpotlightCard interactive={false} className="p-5">
            <h2 className="text-sm font-semibold">Traffic source</h2>
            <p className="mb-1 text-xs text-ink-muted">Sessions · 30 days</p>
            {loading || !data ? <ChartSkeleton height={210} /> : (
              <Donut slices={data.trafficSources} colors={[series[0], series[1], series[2], series[3]]} />
            )}
          </SpotlightCard>
        </div>
      </motion.div>
    </>
  )
}

function HeatmapSkeleton() {
  return (
    <div className="grid grid-cols-[auto_repeat(10,1fr)] gap-1" aria-busy>
      {Array.from({ length: 110 }).map((_, i) => (
        <Skeleton key={i} className="h-9 min-w-9" />
      ))}
    </div>
  )
}

/* ── Retention heatmap: diagonal cascade + row/col cross-highlight ── */
function RetentionHeatmap({ cohorts }: { cohorts: CohortRow[] }) {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const offsets = cohorts[0].retention.length

  return (
    <div
      className="snap-x snap-proximity overflow-x-auto pb-2 [scrollbar-width:thin]"
      onMouseLeave={() => setHover(null)}
    >
      <div
        className="grid min-w-[720px] gap-1"
        style={{ gridTemplateColumns: `130px repeat(${offsets}, minmax(44px, 1fr))` }}
        role="table"
        aria-label="Retention by cohort and month"
      >
        {/* header row */}
        <div className="px-2 py-1 text-xs font-medium text-ink-muted" role="columnheader">
          Cohort
        </div>
        {Array.from({ length: offsets }).map((_, c) => (
          <div
            key={c}
            role="columnheader"
            className={`py-1 text-center font-mono text-xs transition-colors ${
              hover?.c === c ? 'text-emerald-soft' : 'text-ink-muted'
            }`}
          >
            M{c}
          </div>
        ))}

        {cohorts.map((row, r) => (
          <div key={row.cohort} role="row" className="contents [&>*:first-child]:snap-start">
            <div
              role="rowheader"
              className={`flex flex-col justify-center px-2 transition-colors ${
                hover?.r === r ? 'text-ink-primary' : 'text-ink-secondary'
              }`}
            >
              <span className="text-xs font-medium">{row.cohort}</span>
              <span className="font-mono text-[10px] text-ink-muted">{compact(row.size)} users</span>
            </div>
            {row.retention.map((v, c) => {
              const dimmed = hover != null && hover.r !== r && hover.c !== c
              return (
                <motion.div
                  key={c}
                  role="cell"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: (r + c) * 0.045, // diagonal cascade
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onMouseEnter={() => setHover({ r, c })}
                  tabIndex={v == null ? -1 : 0}
                  onFocus={() => setHover({ r, c })}
                  aria-label={v == null ? undefined : `${row.cohort}, month ${c}: ${v}% retained`}
                  className="relative flex h-9 items-center justify-center rounded-md font-mono text-[11px] outline-none transition-[opacity,box-shadow] duration-200"
                  style={{
                    background: v == null ? 'rgba(255,255,255,0.02)' : emeraldAt(v / 100),
                    color: v == null ? 'transparent' : v > 55 ? '#06281D' : '#D8F5E8',
                    opacity: dimmed ? 0.25 : 1,
                    boxShadow:
                      hover?.r === r && hover?.c === c
                        ? '0 0 0 2px #0A0A0A, 0 0 0 3.5px #34D399'
                        : 'none',
                    cursor: v == null ? 'default' : 'pointer',
                  }}
                >
                  {v != null && pct(v, v === 100 ? 0 : 1)}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Donut with radial draw-in ── */
function Donut({ slices, colors }: { slices: DonutSlice[]; colors: readonly string[] }) {
  const total = slices.reduce((a, s) => a + s.value, 0)
  const option = useMemo(
    () => ({
      textStyle: { fontFamily: chartFont },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: tooltipCss,
        formatter: (p: unknown) => {
          const { name, value, percent } = p as { name: string; value: number; percent: number }
          const el = document.createElement('div')
          const label = document.createElement('div')
          label.style.cssText = `color:${ink.secondary};font-size:11px`
          label.textContent = name
          const val = document.createElement('div')
          val.style.cssText = `color:${ink.primary};font-size:15px;font-weight:600;font-family:${monoFont}`
          val.textContent = `${value.toLocaleString()} · ${percent}%`
          el.append(label, val)
          return el
        },
      },
      legend: {
        bottom: 0,
        icon: 'rect',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: ink.secondary, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '84%'],
          center: ['50%', '44%'],
          padAngle: 2,
          itemStyle: { borderRadius: 6, borderColor: '#121212', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            scaleSize: 6,
            itemStyle: { shadowBlur: 24, shadowColor: 'rgba(16,185,129,0.25)' },
          },
          data: slices.map((s, i) => ({ name: s.label, value: s.value, itemStyle: { color: colors[i] } })),
          animationType: 'scale' as const,
          animationEasing: 'cubicOut' as const,
          animationDuration: 1100,
          animationDelay: (idx: number) => idx * 120,
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: compact(total),
            fill: '#F5F5F2',
            fontSize: 22,
            fontWeight: 600,
            fontFamily: monoFont,
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '50%',
          style: { text: 'total', fill: ink.muted, fontSize: 11, fontFamily: chartFont },
        },
      ],
    }),
    [slices, colors, total],
  )
  return <EChart option={option} height={230} />
}
