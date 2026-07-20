import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.header>
  )
}
