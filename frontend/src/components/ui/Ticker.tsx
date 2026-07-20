import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

/**
 * Slot-machine number: each character column flips vertically when its
 * character changes. Non-digits (,.$%KM) cross-fade in place.
 */
export function Ticker({ value, className }: { value: string; className?: string }) {
  const chars = value.split('')
  return (
    <span className={clsx('inline-flex overflow-hidden tabular', className)} aria-label={value} role="text">
      {chars.map((ch, i) => (
        <span key={`${i}-${chars.length}`} className="relative inline-block" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30, delay: i * 0.02 }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
