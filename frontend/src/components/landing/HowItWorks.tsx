import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Database, Cpu, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Database,
    color: '#6366f1',
    title: 'Connect your data',
    description:
      'Point InsightFlow to your PostgreSQL database or upload a CSV. Our ETL pipeline automatically ingests, cleans, and loads your data into a structured analytics warehouse.',
    detail: ['PostgreSQL, MySQL, BigQuery', 'CSV and JSON file uploads', 'Incremental sync with watermarking', 'Data quality checks built-in'],
  },
  {
    number: '02',
    icon: Cpu,
    color: '#a78bfa',
    title: 'We build the warehouse',
    description:
      'InsightFlow automatically creates dimension tables, fact tables, pre-computed views, and optimized indexes — all without any SQL or data engineering on your end.',
    detail: ['Star schema modelling', '12 pre-built analytics views', 'Automatic partitioning', 'Query caching layer'],
  },
  {
    number: '03',
    icon: MessageSquare,
    color: '#34d399',
    title: 'Ask questions, get answers',
    description:
      'Open the AI Copilot and ask anything in plain English. Get instant SQL, live data results, and a narrative insight — with no waiting for a data team.',
    detail: ['Natural language to SQL', 'Instant chart rendering', 'Business narrative generation', 'Actionable recommendations'],
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative" ref={ref} aria-label="How it works">
      {/* Background radial */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-[100px] opacity-10"
          style={{ background: 'radial-gradient(ellipse, #a78bfa 0%, transparent 70%)' }} />
      </div>

      <div className="container-max section-padding">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-4">How it works</p>
          <h2 className="font-display font-bold text-text mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
            From raw data to insights
            <br /><span className="gradient-text">in three steps</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-lg mx-auto">
            No data engineers. No SQL expertise. No six-month implementation project.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4) 30%, rgba(99,102,241,0.4) 70%, transparent)' }} />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="landing-card h-full flex flex-col gap-5">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border z-10 relative"
                        style={{ background: `${step.color}12`, borderColor: `${step.color}30` }}>
                        <Icon size={20} style={{ color: step.color }} />
                      </div>
                    </div>
                    <span className="text-4xl font-black text-white/[0.06] select-none">{step.number}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-text mb-2">{step.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                  </div>

                  {/* Detail checklist */}
                  <ul className="space-y-1.5 mt-auto pt-4 border-t border-white/[0.05]">
                    {step.detail.map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle size={12} style={{ color: step.color, flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          <a href="/app/executive" className="btn-gradient-lg inline-flex items-center gap-2 group">
            See the dashboard live
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
