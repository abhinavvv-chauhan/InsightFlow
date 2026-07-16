import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Users, Activity } from 'lucide-react';

const easeOut = 'easeOut' as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

// Animated mini dashboard preview
function MiniDashboard() {
  const bars = [65, 80, 45, 90, 70, 55, 85];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Glow behind the card */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #6366f1 0%, transparent 70%)' }} />

      {/* Main dashboard card */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.1]"
        style={{ background: 'rgba(15,15,28,0.95)', boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}>
        
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]"
          style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md text-xs text-muted bg-white/[0.04] border border-white/[0.06] font-mono">
              insightflow.app/executive
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-5 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Revenue', value: '₹24.8L', change: '+12.4%', icon: TrendingUp, color: '#6366f1' },
              { label: 'Active Users', value: '8,391', change: '+5.2%', icon: Users, color: '#a78bfa' },
              { label: 'Conversion', value: '3.2%', change: '+0.8%', icon: Activity, color: '#34d399' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="rounded-xl p-3 border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-muted font-medium uppercase tracking-wide">{kpi.label}</span>
                  <kpi.icon size={12} style={{ color: kpi.color }} />
                </div>
                <div className="text-base font-bold text-text">{kpi.value}</div>
                <div className="text-[10px] text-success mt-0.5 font-medium">{kpi.change}</div>
              </motion.div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text">Revenue Trend</span>
              <span className="text-[10px] text-muted bg-white/[0.04] px-2 py-0.5 rounded-md">Last 7 days</span>
            </div>
            <div className="h-16 flex items-end gap-1.5">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.9 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className="flex-1 rounded-sm origin-bottom"
                  style={{
                    height: `${h}%`,
                    background: i === 5 ? 'linear-gradient(to top, #6366f1, #a78bfa)' : 'rgba(99,102,241,0.25)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* AI Copilot preview */}
          <div className="rounded-xl p-3.5 border border-primary/20 bg-primary/[0.06] flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
              <Sparkles size={11} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-light mb-1">AI Copilot</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-[11px] text-text-secondary leading-relaxed"
              >
                Revenue grew 12.4% this week, driven by Electronics (+18%) and Apparel (+9%). 
                Consider boosting inventory in high-margin categories.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-12 top-10 w-24 h-24 rounded-xl border border-white/[0.08] hidden lg:flex items-center justify-center"
        style={{ background: 'rgba(15,15,28,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <div className="text-center">
          <div className="text-xl font-bold gradient-text">99%</div>
          <div className="text-[9px] text-muted mt-0.5">Uptime SLA</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -left-10 bottom-14 w-20 h-20 rounded-xl border border-white/[0.08] hidden lg:flex items-center justify-center"
        style={{ background: 'rgba(15,15,28,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <div className="text-center">
          <div className="text-lg font-bold text-success">12ms</div>
          <div className="text-[9px] text-muted mt-0.5">Avg Query</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden" aria-label="Hero">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        {/* Grid */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, #a78bfa 40%, transparent 70%)' }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-max section-padding">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="eyebrow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Product Analytics
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-balance mx-auto mb-6 font-display"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '1.05',
              letterSpacing: '-0.04em',
              fontWeight: 800,
              maxWidth: '14ch',
            }}
          >
            Your product data,{' '}
            <span className="gradient-text">finally making sense.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={itemVariants}
            className="text-text-secondary text-lg md:text-xl leading-relaxed text-balance mx-auto mb-10"
            style={{ maxWidth: '52ch' }}
          >
            InsightFlow transforms your raw event data into executive dashboards, 
            funnel analysis, and AI-powered insights — in minutes, not months.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/app/executive" className="btn-gradient-lg group w-full sm:w-auto">
              Start for Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#features" className="btn-outline-lg w-full sm:w-auto"
              onClick={e => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See how it works
            </a>
          </motion.div>

          {/* Social proof micro-text */}
          <motion.p variants={itemVariants} className="mt-6 text-xs text-muted">
            No credit card required &nbsp;·&nbsp; Setup in under 5 minutes &nbsp;·&nbsp; Cancel any time
          </motion.p>
        </motion.div>

        {/* Dashboard mockup */}
        <MiniDashboard />
      </div>
    </section>
  );
}
