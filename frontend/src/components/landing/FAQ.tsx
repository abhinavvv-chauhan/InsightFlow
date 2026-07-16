import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What databases does InsightFlow support?',
    a: 'InsightFlow natively supports PostgreSQL (including Neon, Supabase, and RDS), MySQL, and BigQuery. CSV and JSON file uploads are supported on all plans. Additional connectors for Snowflake and Redshift are on our roadmap.',
  },
  {
    q: 'How does the AI Copilot work?',
    a: 'The AI Copilot uses a two-phase pipeline: first it converts your natural language question into a validated, read-only SQL query against your analytics views; then it executes the query and generates a plain-English business narrative from the results. Your data never leaves your region.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II compliant. The AI Copilot only performs SELECT queries — it cannot modify or delete your data. You can revoke access at any time.',
  },
  {
    q: 'Can I use InsightFlow without a data team?',
    a: 'That\'s exactly what InsightFlow is designed for. You don\'t need to write SQL, manage ETL pipelines, or understand data modelling. Connect your database, and InsightFlow sets everything up automatically.',
  },
  {
    q: 'How long does onboarding take?',
    a: 'Most teams are fully onboarded in under 5 minutes. Connect your database, wait for the initial sync (usually 2–10 minutes depending on data size), and your dashboards are ready. No configuration files, no code, no manual setup.',
  },
  {
    q: 'What happens when I exceed my plan limits?',
    a: 'We\'ll notify you proactively when you approach your event limit. Your dashboards will continue to work — we never cut you off mid-month. You\'ll have the option to upgrade or we\'ll work with you on a custom plan.',
  },
  {
    q: 'Do you offer a free trial for paid plans?',
    a: 'Yes. The Growth plan includes a 14-day free trial with no credit card required. You\'ll get full access to all features, including unlimited AI Copilot queries, during the trial period.',
  },
];

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="accordion-item"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left py-0 focus:outline-none group"
        aria-expanded={open}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
      >
        <span className="text-sm font-medium text-text group-hover:text-text transition-colors">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 w-6 h-6 rounded-full border border-white/[0.08] flex items-center justify-center bg-white/[0.03]"
        >
          <ChevronDown size={13} className="text-muted" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-btn-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted leading-relaxed pt-3 pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="faq" className="py-24 md:py-32" ref={ref} aria-label="FAQ">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label mb-4">FAQ</p>
            <h2 className="font-display font-bold text-text mb-4"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
              Questions we hear all the time
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Can't find what you're looking for? Reach out and we'll get back to you within one business day.
            </p>
            <a href="mailto:hello@insightflow.app"
              className="btn-outline text-sm">
              Contact support
            </a>
          </motion.div>

          {/* Right: Accordion */}
          <div className="lg:col-span-8">
            {faqs.map((item, i) => (
              <FAQItem key={item.q} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
