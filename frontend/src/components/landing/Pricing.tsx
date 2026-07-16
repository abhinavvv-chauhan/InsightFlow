import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, Building2, Sparkles } from 'lucide-react';

type BillingCycle = 'monthly' | 'annual';

const plans = [
  {
    icon: Zap,
    name: 'Starter',
    tagline: 'Perfect for solo founders and small teams.',
    monthly: 0,
    annual: 0,
    cta: 'Get started free',
    ctaVariant: 'outline' as const,
    featured: false,
    features: [
      '1 data source',
      'Up to 100K events/month',
      '5 pre-built dashboards',
      'AI Copilot (20 queries/day)',
      '7-day data retention',
      'CSV export',
      'Email support',
    ],
  },
  {
    icon: Sparkles,
    name: 'Growth',
    tagline: 'For growing teams that need deeper insights.',
    monthly: 79,
    annual: 59,
    cta: 'Start 14-day trial',
    ctaVariant: 'gradient' as const,
    featured: true,
    features: [
      'Up to 5 data sources',
      'Up to 5M events/month',
      'All dashboards + custom views',
      'AI Copilot (unlimited)',
      '90-day data retention',
      'Real-time sync',
      'Slack alerts',
      'Priority support',
    ],
  },
  {
    icon: Building2,
    name: 'Enterprise',
    tagline: 'Custom contracts for larger organizations.',
    monthly: null,
    annual: null,
    cta: 'Talk to sales',
    ctaVariant: 'outline' as const,
    featured: false,
    features: [
      'Unlimited data sources',
      'Unlimited events',
      'Custom data models',
      'SSO & SAML',
      'Unlimited retention',
      'Dedicated infrastructure',
      'SLA guarantee',
      '24/7 dedicated support',
      'Custom onboarding',
    ],
  },
];

function PriceDisplay({ plan, cycle }: { plan: typeof plans[0]; cycle: BillingCycle }) {
  const price = cycle === 'annual' ? plan.annual : plan.monthly;
  if (price === null) return (
    <div className="flex items-end gap-1">
      <span className="text-3xl font-bold text-text">Custom</span>
    </div>
  );
  if (price === 0) return (
    <div className="flex items-end gap-1">
      <span className="text-3xl font-bold text-text">Free</span>
      <span className="text-muted text-sm mb-1">forever</span>
    </div>
  );
  return (
    <div className="flex items-end gap-1">
      <span className="text-muted text-lg mb-1">$</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold text-text"
        >
          {price}
        </motion.span>
      </AnimatePresence>
      <span className="text-muted text-sm mb-1">/mo</span>
    </div>
  );
}

export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="py-24 md:py-32 relative" ref={ref} aria-label="Pricing">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px divider" />
        <div className="absolute inset-x-0 bottom-0 h-px divider" />
      </div>

      <div className="container-max section-padding">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-4">Pricing</p>
          <h2 className="font-display font-bold text-text mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
            Simple, transparent pricing
          </h2>
          <p className="text-text-secondary text-lg max-w-md mx-auto mb-8">
            Start free. Scale when you need to. No surprise bills.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4">
            <div className="toggle-wrap">
              <button
                className={`toggle-option ${cycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`toggle-option ${cycle === 'annual' ? 'active' : ''}`}
                onClick={() => setCycle('annual')}
              >
                Annual
              </button>
            </div>
            <AnimatePresence>
              {cycle === 'annual' && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="badge-success text-xs"
                >
                  Save 25%
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={plan.featured ? 'pricing-card-featured' : 'pricing-card'}
              >
                {/* Popular badge */}
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge-primary px-4 py-1 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <Icon size={17} className="text-primary-light" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-text">{plan.name}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="py-4 border-y border-white/[0.07]">
                  <PriceDisplay plan={plan} cycle={cycle} />
                  {plan.monthly !== null && plan.monthly !== 0 && cycle === 'annual' && (
                    <p className="text-xs text-muted mt-1">Billed annually. ${plan.monthly}/mo billed monthly.</p>
                  )}
                </div>

                {/* CTA */}
                <a
                  href="/app/executive"
                  className={
                    plan.ctaVariant === 'gradient'
                      ? 'btn-gradient w-full justify-center'
                      : 'btn-outline w-full justify-center'
                  }
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </a>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-muted">
                      <Check size={14} className="text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-muted mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          All plans include SSL, 99.9% uptime SLA, and GDPR-compliant data processing.
        </motion.p>
      </div>
    </section>
  );
}
