import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Lenis from 'lenis'
import {
  LayoutDashboard,
  Filter,
  Users,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
} from 'lucide-react'
import clsx from 'clsx'
import { CopilotWidget } from '../CopilotWidget'

const NAV = [
  { to: '/', label: 'Executive Hub', icon: LayoutDashboard },
  { to: '/funnel', label: 'Funnel Engine', icon: Filter },
  { to: '/cohorts', label: 'Customer Cohorts', icon: Users },
  { to: '/products', label: 'Product Leaderboard', icon: Trophy },
]

export function Shell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh">
      {/* ─── Desktop sidebar ─── */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-hairline bg-obsidian-950/70 backdrop-blur-xl md:flex"
      >
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber to-amber-deep shadow-glow-amber">
            <Activity className="size-5 text-obsidian-950" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="whitespace-nowrap text-lg font-semibold tracking-tight"
              >
                InsightFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <LayoutGroup id="sidebar">
          <nav className="mt-4 flex flex-col gap-1 px-3" aria-label="Primary">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} title={collapsed ? label : undefined}>
                {({ isActive }) => (
                  <motion.span
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    className={clsx(
                      'relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      isActive ? 'text-amber' : 'text-ink-secondary hover:text-ink-primary',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        className="absolute inset-0 rounded-xl border border-amber/15 bg-amber/[0.07]"
                      />
                    )}
                    <Icon className="relative size-[18px] shrink-0" strokeWidth={2} />
                    {!collapsed && <span className="relative whitespace-nowrap">{label}</span>}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>
        </LayoutGroup>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mx-3 mb-4 mt-auto flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-ink-muted transition-colors hover:bg-white/[0.04] hover:text-ink-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </motion.aside>

      {/* ─── Main ─── */}
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8 2xl:max-w-[1880px]"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* ─── Mobile frosted bottom dock ─── */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-3 bottom-3 z-50 flex h-16 items-center justify-around rounded-2xl border border-hairline bg-obsidian-900/70 shadow-card backdrop-blur-2xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <LayoutGroup id="dock">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="relative flex-1" aria-label={label}>
              {({ isActive }) => (
                <span className="relative mx-auto flex h-12 w-16 flex-col items-center justify-center gap-0.5">
                  {isActive && (
                    <motion.span
                      layoutId="dock-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      className="absolute inset-0 rounded-xl bg-amber/[0.1]"
                    />
                  )}
                  <Icon
                    className={clsx('relative size-5', isActive ? 'text-amber' : 'text-ink-muted')}
                    strokeWidth={2}
                  />
                  <span
                    className={clsx(
                      'relative text-[10px] font-medium',
                      isActive ? 'text-amber' : 'text-ink-muted',
                    )}
                  >
                    {label.split(' ')[0]}
                  </span>
                </span>
              )}
            </NavLink>
          ))}
        </LayoutGroup>
      </nav>

      {/* ─── Floating AI Copilot widget ─── */}
      <CopilotWidget />
    </div>
  )
}
