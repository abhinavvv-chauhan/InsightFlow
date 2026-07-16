import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" ref={ref} aria-label="Call to action">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.08) 50%, rgba(192,132,252,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 0 80px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] blur-[80px] opacity-25"
              style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }} />
          </div>

          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <Sparkles size={28} className="text-white" />
          </div>

          <h2 className="font-display font-bold text-text mb-4 mx-auto"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: '1.1', maxWidth: '18ch' }}>
            Start making data-driven decisions{' '}
            <span className="gradient-text">today</span>
          </h2>

          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10 text-balance">
            Join teams using InsightFlow to understand their users, optimize their funnels, 
            and grow revenue — without needing a data team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/app/executive" className="btn-gradient-lg w-full sm:w-auto group">
              Start for Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="/app/executive" className="btn-outline-lg w-full sm:w-auto">
              View live demo
            </a>
          </div>

          <p className="text-xs text-muted mt-6">
            Free forever plan available &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp; Setup in 5 minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
