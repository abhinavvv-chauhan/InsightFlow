/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0A0A0A',
          900: '#121212',
          850: '#161616',
          800: '#1C1C1C',
          700: '#242424',
        },
        amber: {
          DEFAULT: '#F59E0B',
          soft: '#FBBF24',
          deep: '#D97706',
        },
        emerald: {
          DEFAULT: '#10B981',
          soft: '#34D399',
          deep: '#0A8A5F',
        },
        ink: {
          primary: '#F5F5F2',
          secondary: '#A6A5A0',
          muted: '#6E6D68',
        },
        hairline: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 32px -8px rgba(245,158,11,0.35)',
        'glow-emerald': '0 0 32px -8px rgba(16,185,129,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 32px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
