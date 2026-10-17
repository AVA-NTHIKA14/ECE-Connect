/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A1B38',
          900: '#102A56', // Primary brand & heading color
          800: '#183B75',
          700: '#2353A1',
          600: '#316DC5',
          100: '#E8EFF9',
          50: '#F2F6FC',
        },
        teal: {
          900: '#03343A',
          800: '#06636E',
          700: '#07717D',
          600: '#087F8C', // Primary interactive accent
          500: '#0AA5B6',
          400: '#26BCD0',
          100: '#D5F4F7',
          50: '#EAF8FA',
        },
        board: {
          bg: '#FAF9F6', // Page background
          card: '#FFFFFF',
          surface: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B',
        }
      },
      fontSize: {
        'page-heading': ['2.375rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '800' }], // ~38px
        'section-heading': ['1.625rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }], // 26px
        'card-title': ['1.1875rem', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '700' }], // 19px
        'body-base': ['1rem', { lineHeight: '1.6' }], // 16px
        'body-small': ['0.9375rem', { lineHeight: '1.55' }], // 15px
        'meta': ['0.875rem', { lineHeight: '1.4' }], // 14px
        'meta-sub': ['0.8125rem', { lineHeight: '1.4' }], // 13px
        'tag': ['0.75rem', { lineHeight: '1', fontWeight: '600' }], // 12px
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'paper': '0 1px 3px 0 rgba(16, 42, 86, 0.05), 0 1px 2px -1px rgba(16, 42, 86, 0.05)',
        'paper-hover': '0 10px 20px -4px rgba(16, 42, 86, 0.08), 0 4px 6px -2px rgba(16, 42, 86, 0.03)',
        'stamp': '0 0 0 2px currentColor',
      }
    },
  },
  plugins: [],
}
