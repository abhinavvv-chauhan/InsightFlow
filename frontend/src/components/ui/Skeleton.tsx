import clsx from 'clsx'
import type { CSSProperties } from 'react'

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={clsx('skeleton', className)} style={style} aria-hidden />
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="flex flex-col gap-3 p-1" style={{ height }} aria-busy>
      <div className="flex gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-1 items-end gap-2">
        {[0.5, 0.7, 0.45, 0.85, 0.6, 0.95, 0.75, 0.55, 0.8, 0.65, 0.9, 0.7].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
    </div>
  )
}
