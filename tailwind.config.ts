import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        highlight: '#e94560',
        success: '#00b894',
        card: '#1e293b',
        'card-hover': '#243447',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-live': 'pulse-live 1.5s ease-in-out infinite',
        'flash-score': 'flash-score 0.6s ease-in-out',
        'skeleton-wave': 'skeleton-wave 1.5s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        'flash-score': {
          '0%': { backgroundColor: 'rgba(233, 69, 96, 0.5)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'skeleton-wave': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
    },
  },
  plugins: [],
}
export default config
