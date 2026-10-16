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
        dark: {
          950: '#000000',
          900: '#060606',
          850: '#0B0B0B',
          800: '#121212',
          750: '#181818',
          700: '#222222',
          600: '#333333',
          500: '#555555',
          400: '#888888',
          300: '#AAAAAA',
          200: '#D4D4D4',
          100: '#EEEEEE',
          50: '#FAFAFA',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(255, 255, 255, 0.05)',
        'glow-md': '0 0 25px rgba(255, 255, 255, 0.08)',
        'glow-lg': '0 0 40px rgba(255, 255, 255, 0.12)',
        'inner-glow': 'inset 0 0 15px rgba(255, 255, 255, 0.04)',
      },
      animation: {
        'float-slow': 'floating 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
