import { useId, useMemo } from 'react'
import { motion } from 'framer-motion'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

/** Lightweight SVG sparkline with draw-in animation, for table cells. */
export function Sparkline({ data, width = 110, height = 30, color = '#F59E0B' }: SparklineProps) {
  const gradId = useId()
  const { line, area } = useMemo(() => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pad = 3
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 2)
      const y = pad + (1 - (v - min) / range) * (height - pad * 2)
      return [x + 1, y] as const
    })
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`
    return { line, area }
  }, [data, width, height])

  const up = data[data.length - 1] >= data[0]
  const stroke = color === 'auto' ? (up ? '#34D399' : '#F87171') : color

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <circle
        cx={width - 1}
        cy={
          3 +
          (1 - (data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) *
            (height - 6)
        }
        r={2.5}
        fill={stroke}
        stroke="#121212"
        strokeWidth={1.5}
      />
    </svg>
  )
}
