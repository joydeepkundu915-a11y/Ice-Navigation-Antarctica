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
        polar: {
          900: '#060d17',
          850: '#0a1424',
          800: '#0e1d33',
          700: '#162b4c',
          600: '#1f3c69',
          500: '#2d538e',
          400: '#4376c2',
          300: '#73a1e4',
          200: '#a8c6f4',
          100: '#dbe7fb',
          50: '#f0f5fd',
        },
        ice: {
          cyan: '#38bdf8',
          glow: '#00f2fe',
          frost: '#e0f2fe',
          warning: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981'
        },
        radar: {
          green: '#22c55e',
          beam: 'rgba(34, 197, 94, 0.25)',
          grid: 'rgba(34, 197, 94, 0.15)',
          target: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
