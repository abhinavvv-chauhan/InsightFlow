import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Zap, BarChart3, Lock } from 'lucide-react';

const stats = [
  { value: '< 5min', label: 'Average onboarding time', icon: Zap },
  { value: '12ms', label: 'Average query response', icon: BarChart3 },
  { value: '99.9%', label: 'Uptime SLA', icon: Shield },
  { value: 'SOC 2', label: 'Type II compliant', icon: Lock },
];

const integrations = [
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Neon', color: '#00e5b3' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'BigQuery', color: '#4285f4' },
  { name: 'MySQL', color: '#f29111' },
  { name: 'Snowflake', color: '#29b5e8' },
];

export default function LogoBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-16 relative" ref={ref} aria-label="Trust indicators">
      <div className="container-max section-padding">
        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="stat-card group hover:border-white/[0.12] transition-all duration-300"
              >
                <Icon size={16} className="text-primary-light" />
                <div className="text-2xl font-bold text-text">{stat.value}</div>
                <div className="text-xs text-muted leading-snug">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Divider with label */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-xs text-muted whitespace-nowrap uppercase tracking-widest font-medium px-2">Compatible with</span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </motion.div>

        {/* Integrations */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] 
                hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200 cursor-default"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: integration.color }} />
              <span className="text-sm font-medium text-text-secondary">{integration.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
