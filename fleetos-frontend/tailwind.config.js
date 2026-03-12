/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        fleet: {
          bg:       '#080c14',
          surface:  '#0d1421',
          border:   '#1a2540',
          muted:    '#1e2d47',
          text:     '#c8d6f0',
          subtle:   '#5a7299',
          amber:    '#f59e0b',
          'amber-dim': '#92610a',
          emerald:  '#10b981',
          rose:     '#f43f5e',
          sky:      '#38bdf8',
          indigo:   '#6366f1',
        }
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
        'scan-line':  'scanLine 3s linear infinite',
        'ticker':     'ticker 0.3s ease forwards',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' },
                    to:   { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        scanLine: { '0%': { top: '0%' }, '100%': { top: '100%' } },
        ticker:   { from: { opacity: 0, transform: 'translateY(6px)' },
                    to:   { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        'amber-glow': '0 0 24px rgba(245,158,11,0.15)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'inset-top':  'inset 0 1px 0 rgba(255,255,255,0.06)',
      }
    }
  },
  plugins: []
}
