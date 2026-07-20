import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingDown, Smartphone, MapPin } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SpotlightCard } from '../components/ui/SpotlightCard'
import { Skeleton } from '../components/ui/Skeleton'
import { pageStagger, rise } from '../components/ui/motion'
import { useAsync } from '../hooks/useAsync'
import { api } from '../data/api'
import { ordinalAmber } from '../lib/palette'
import { compact, pct } from '../lib/format'
import type { FunnelStep, FunnelDropoffDetail } from '../data/types'

export function Funnel() {
  const { data: steps, loading } = useAsync(() => api.funnel())
  const { data: dropoffs } = useAsync(() => api.funnelDropoffs())
  const [selected, setSelected] = useState<number | null>(null)

  const detail: FunnelDropoffDetail | null =
    selected != null && dropoffs ? dropoffs[selected] : null

  return (
    <>
      <PageHeader
        title="Funnel Engine"
        subtitle="Session progression through the purchase funnel · click a drop-off to inspect it"
      />
      <div className="flex flex-col gap-4 xl:flex-row">
        <motion.div variants={pageStagger} initial="hidden" animate="show" className="min-w-0 flex-1">
          <SpotlightCard interactive={false} className="p-5 sm:p-8">
            {loading || !steps ? <FunnelSkeleton /> : (
              <FunnelBars steps={steps} selected={selected} onSelect={setSelected} />
            )}
          </SpotlightCard>
        </motion.div>

        {/* slide-out drop-off panel */}
        <AnimatePresence>
          {detail && selected != null && steps && (
            <DropoffPanel
              key={detail.step}
              detail={detail}
              step={steps[selected]}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function FunnelSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-12" style={{ width: `${95 - i * 12}%` }} />
        </div>
      ))}
    </div>
  )
}

function FunnelBars({
  steps,
  selected,
  onSelect,
}: {
  steps: FunnelStep[]
  selected: number | null
  onSelect: (i: number | null) => void
}) {
  const max = steps[0].sessions
  return (
    <div className="flex flex-col" role="list" aria-label="Purchase funnel">
      {steps.map((s, i) => {
        const widthPct = (s.sessions / max) * 100
        const color = ordinalAmber[i]
        const isSelected = selected === i
        return (
          <div key={s.step} role="listitem">
            {/* drop-off connector between stages */}
            {i > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.12 }}
                onClick={() => onSelect(isSelected ? null : i)}
                className="group ml-[7.5rem] flex items-center gap-2 py-1.5 pl-1 pr-3 text-xs text-ink-muted transition-colors hover:text-[#F87171] sm:ml-[8.5rem]"
                aria-label={`Inspect ${pct(s.dropoffPct)} drop-off before ${s.step}`}
                aria-expanded={isSelected}
              >
                <TrendingDown className="size-3.5" />
                <span className="tabular font-medium">−{pct(s.dropoffPct)}</span>
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  inspect drop-off →
                </span>
              </motion.button>
            )}
            <div className="flex items-center gap-4">
              <div className="w-[6.5rem] shrink-0 text-right sm:w-[7.5rem]">
                <div className="truncate text-sm font-medium">{s.step}</div>
                <div className="tabular text-xs text-ink-muted">{pct(s.conversionPct)} of top</div>
              </div>
              <div className="relative h-12 min-w-0 flex-1">
                <motion.button
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${widthPct}%`, opacity: 1 }}
                  transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scaleY: 1.06 }}
                  onClick={() => i > 0 && onSelect(isSelected ? null : i)}
                  className="relative block h-full origin-left cursor-pointer rounded-r-lg"
                  style={{
                    background: `linear-gradient(90deg, ${color}E6, ${color})`,
                    boxShadow: isSelected
                      ? `0 0 0 2px #0A0A0A, 0 0 0 3.5px ${color}`
                      : `0 4px 24px -8px ${color}55`,
                    minWidth: 56,
                  }}
                  aria-label={`${s.step}: ${s.sessions.toLocaleString()} sessions`}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.12 }}
                    className="absolute inset-y-0 left-3 flex items-center font-mono text-sm font-semibold"
                    style={{ color: i < 3 ? '#1A1305' : '#FFF7E8' }}
                  >
                    {compact(s.sessions)}
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DropoffPanel({
  detail,
  step,
  onClose,
}: {
  detail: FunnelDropoffDetail
  step: FunnelStep
  onClose: () => void
}) {
  const droppedTotal = useMemo(
    () => detail.devices.reduce((a, d) => a + d.dropped, 0),
    [detail],
  )
  return (
    <motion.aside
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="card w-full shrink-0 p-5 xl:w-[380px]"
      aria-label={`Drop-off detail for ${detail.step}`}
    >
      <div className="mb-1 flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[#F87171]">
            Drop-off · −{pct(step.dropoffPct)}
          </div>
          <h2 className="mt-1 text-lg font-semibold">Before “{detail.step}”</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink-primary"
          aria-label="Close panel"
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="text-sm text-ink-secondary">
        <span className="tabular font-mono font-semibold text-ink-primary">
          {droppedTotal.toLocaleString()}
        </span>{' '}
        sessions abandoned at this stage.
      </p>

      <BreakdownList
        icon={<Smartphone className="size-3.5" />}
        title="By device"
        slices={detail.devices}
        total={droppedTotal}
      />
      <BreakdownList
        icon={<MapPin className="size-3.5" />}
        title="By city"
        slices={detail.cities}
        total={detail.cities.reduce((a, c) => a + c.dropped, 0)}
      />
    </motion.aside>
  )
}

function BreakdownList({
  icon,
  title,
  slices,
  total,
}: {
  icon: React.ReactNode
  title: string
  slices: { label: string; dropped: number }[]
  total: number
}) {
  const sorted = [...slices].sort((a, b) => b.dropped - a.dropped)
  const max = sorted[0]?.dropped ?? 1
  return (
    <motion.div variants={pageStagger} initial="hidden" animate="show" className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink-muted">
        {icon} {title}
      </div>
      <div className="flex flex-col gap-2.5">
        {sorted.map((s) => (
          <motion.div key={s.label} variants={rise}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span>{s.label}</span>
              <span className="tabular font-mono text-xs text-ink-secondary">
                {s.dropped.toLocaleString()} · {pct((s.dropped / total) * 100, 0)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(s.dropped / max) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B)' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
