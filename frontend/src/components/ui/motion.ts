import type { Variants, Transition } from 'framer-motion'

export const spring: Transition = { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }
export const softSpring: Transition = { type: 'spring', stiffness: 170, damping: 26 }

export const pageStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
}
