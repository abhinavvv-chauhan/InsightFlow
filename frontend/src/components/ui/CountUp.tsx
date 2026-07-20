import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface CountUpProps {
  value: number
  format?: (n: number) => string
  className?: string
  duration?: number
}

/** Animates from 0 to `value` when scrolled into view, then tracks value changes. */
export function CountUp({ value, format = (n) => Math.round(n).toLocaleString(), className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 55, damping: 18 })

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    const unsub = springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = format(latest)
    })
    return unsub
  }, [springValue, format])

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  )
}
