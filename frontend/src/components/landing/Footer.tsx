import { Activity, MessageCircle, Code2, Briefcase, ArrowUpRight } from 'lucide-react';

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Guides', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'DPA', href: '#' },
  ],
};

const socials = [
  { icon: MessageCircle, href: '#', label: 'Twitter' },
  { icon: Code2, href: 'https://github.com/abhinavvv-chauhan/InsightFlow', label: 'GitHub' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative pt-16 pb-8 border-t border-white/[0.07]" role="contentinfo">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-background/50 to-transparent" />
      </div>

      <div className="container-max section-padding">
        {/* Top: Logo + links grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
                <Activity size={15} className="text-white" />
              </div>
              <span className="text-base font-bold text-text tracking-tight">InsightFlow</span>
            </a>
            <p className="text-sm text-muted leading-relaxed max-w-xs mb-5">
              AI-powered product analytics for teams who want answers, not more dashboards to maintain.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-muted hover:text-text hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="col-span-1">
              <p className="text-xs font-semibold text-text tracking-wide mb-4">{category}</p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={e => { if (item.href.startsWith('#')) { e.preventDefault(); scrollToSection(item.href); } }}
                      className="text-sm text-muted hover:text-text transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} InsightFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/abhinavvv-chauhan/InsightFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors">
              <Code2 size={13} />
              Open Source on GitHub
              <ArrowUpRight size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
