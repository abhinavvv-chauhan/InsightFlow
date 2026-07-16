import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import {
  Sparkles, BarChart3, Users, TrendingUp, Package, Zap
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    color: '#6366f1',
    title: 'AI Copilot',
    description: 'Ask questions in plain English and get instant SQL queries, data results, and actionable insights — no technical skills required.',
    tag: 'Most Popular',
  },
  {
    icon: BarChart3,
    color: '#a78bfa',
    title: 'Funnel Intelligence',
    description: 'Visualize every step of your user journey. Identify exact drop-off points and quantify the revenue impact of fixing them.',
    tag: null,
  },
  {
    icon: TrendingUp,
    color: '#34d399',
    title: 'Revenue Tracking',
    description: 'Real-time KPI monitoring with daily, weekly trends. Track revenue, orders, and conversion rates across all dimensions.',
    tag: null,
  },
  {
    icon: Users,
    color: '#f59e0b',
    title: 'Customer Insights',
    description: 'Geographic breakdowns, cohort retention curves, and city-level DAU data. Know exactly who your users are and where they come from.',
    tag: null,
  },
  {
    icon: Package,
    color: '#f87171',
    title: 'Product Analytics',
    description: 'Category revenue mix, top-performing SKUs, and conversion rates by product line. Make inventory decisions with data.',
    tag: null,
  },
  {
    icon: Zap,
    color: '#38bdf8',
    title: 'Zero-Config ETL',
    description: 'Drop a CSV or connect your database. InsightFlow automatically builds your analytics warehouse — no data engineering needed.',
    tag: null,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="py-24 md:py-32 relative" ref={ref} aria-label="Features">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px divider" />
        <div className="absolute inset-x-0 bottom-0 h-px divider" />
      </div>

      <div className="container-max section-padding">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-4">Features</p>
          <h2 className="font-display font-bold text-text mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
            Everything your team needs<br className="hidden md:block" />{' '}
            <span className="gradient-text">to understand your product</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto text-balance">
            From raw events to executive insights — InsightFlow handles the full analytics stack so your team can focus on building.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="landing-card group cursor-default"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${feature.color}12`,
                      borderColor: `${feature.color}30`,
                    }}>
                    <Icon size={20} style={{ color: feature.color }} />
                  </div>
                  {feature.tag && (
                    <span className="badge-primary text-[10px] font-semibold tracking-wider uppercase">
                      {feature.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA strip */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <a href="/app/executive" className="btn-gradient-lg">
            Explore all features
          </a>
        </motion.div>
      </div>
    </section>
  );
}
