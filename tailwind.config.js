export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: '#09090b', // near black
        surface: {
          DEFAULT: '#121214',
          hover: '#1a1a1f',
          border: '#27272a',
        },
        brand: {
          400: '#60a5fa', // Electric Blue
          500: '#3b82f6',
          600: '#2563eb',
        },
        neon: {
          blue: '#06b6d4', // Cyan
          violet: '#8b5cf6',
          pink: '#ec4899',
        },
        rank: {
          bronze: '#cd7f32',
          silver: '#94a3b8',
          gold: '#fbbf24',
          platinum: '#2dd4bf',
          diamond: '#60a5fa',
          master: '#a855f7',
          grandmaster: '#f87171',
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'radar-scan': 'radar-scan 4s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'radar-scan': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'neon-blue': '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
        'neon-violet': '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.2)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.2)',
        'rank-gold': '0 0 20px rgba(251, 191, 36, 0.4)',
        'rank-diamond': '0 0 20px rgba(96, 165, 250, 0.4)',
        'rank-master': '0 0 20px rgba(168, 85, 247, 0.4)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'arena-glow': 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 50%)',
      }
    },
  },
  plugins: [],
};
