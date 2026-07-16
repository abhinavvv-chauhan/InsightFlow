/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark palette
        background: '#080810',
        surface: '#0f0f1c',
        card: '#13131f',
        border: 'rgba(255,255,255,0.07)',
        // Dashboard colors (preserved)
        'dash-bg': '#0f0f1a',
        'dash-surface': '#1e1e2f',
        // Brand
        primary: '#6366f1',
        'primary-light': '#818cf8',
        'primary-dark': '#4f46e5',
        secondary: '#a78bfa',
        accent: '#c084fc',
        // Status
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        // Text
        text: '#f1f5f9',
        'text-secondary': '#cbd5e1',
        muted: '#64748b',
        subtle: '#374151',
        // Neutrals
        'neutral-50': '#f8fafc',
        'neutral-100': '#f1f5f9',
        'neutral-200': '#e2e8f0',
        'neutral-800': '#1e293b',
        'neutral-900': '#0f172a',
        'neutral-950': '#020617',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-lg': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.035em', fontWeight: '800' }],
        'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 80px rgba(99, 102, 241, 0.2)',
        'glow-accent': '0 0 40px rgba(167, 139, 250, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1, #a78bfa)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'border-beam': 'borderBeam 4s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        borderBeam: {
          '100%': { 'offset-distance': '100%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
