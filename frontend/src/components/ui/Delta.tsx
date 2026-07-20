import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import clsx from 'clsx'

interface DeltaProps {
  value: number // percent
  /** whether an increase is good (default true) */
  upIsGood?: boolean
  suffix?: string
}

export function Delta({ value, upIsGood = true, suffix = '%' }: DeltaProps) {
  const up = value >= 0
  const good = up === upIsGood
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular',
        good ? 'bg-emerald/10 text-emerald-soft' : 'bg-[#DC2626]/10 text-[#F87171]',
      )}
    >
      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {Math.abs(value).toFixed(1)}
      {suffix}
      <span className="sr-only">{up ? 'up' : 'down'} vs previous period</span>
    </span>
  )
}
