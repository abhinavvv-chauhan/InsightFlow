import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { rise } from './motion'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** Lift + scale on hover (default true) */
  interactive?: boolean
}

/**
 * Card with a cursor-following border glow. The spotlight lives on a masked
 * pseudo-layer so the 1px hairline border brightens near the pointer.
 */
export function SpotlightCard({ children, className, interactive = true }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--spot-o', '1')
  }

  function onMouseLeave() {
    ref.current?.style.setProperty('--spot-o', '0')
  }

  return (
    <motion.div
      ref={ref}
      variants={rise}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={interactive ? { scale: 1.015, y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx('card group overflow-hidden', className)}
      style={{ ['--spot-o' as string]: 0 }}
    >
      {/* border spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-o)',
          background:
            'radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(245,158,11,0.14), transparent 65%)',
          maskImage: 'linear-gradient(#000, #000), linear-gradient(#000, #000)',
          maskClip: 'padding-box, border-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: 1,
        }}
      />
      {/* faint interior wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: 'calc(var(--spot-o) * 0.5)',
          background:
            'radial-gradient(480px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(245,158,11,0.05), transparent 60%)',
        }}
      />
      {children}
    </motion.div>
  )
}
