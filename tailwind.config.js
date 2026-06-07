export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      animation: {
        'shimmer':       'shimmer 1.8s ease-in-out infinite',
        'glow-pulse':    'glow-pulse 2s ease-in-out infinite',
        'slide-up':      'slide-up 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right':'slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':       'fade-in 0.2s ease-out',
        'scale-in':      'scale-in 0.2s cubic-bezier(0.16,1,0.3,1)',
        'bounce-1':      'bounce-dot 1.2s ease-in-out infinite',
        'bounce-2':      'bounce-dot 1.2s ease-in-out 0.2s infinite',
        'bounce-3':      'bounce-dot 1.2s ease-in-out 0.4s infinite',
        'float':         'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgb(99 102 241 / 0.3)' },
          '50%':       { boxShadow: '0 0 30px rgb(99 102 241 / 0.7)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.93)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'bounce-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%':            { transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'glow-sm':    '0 0 12px rgb(99 102 241 / 0.25)',
        'glow':       '0 0 24px rgb(99 102 241 / 0.35)',
        'glow-lg':    '0 0 48px rgb(99 102 241 / 0.45)',
        'inner-glow': 'inset 0 0 20px rgb(99 102 241 / 0.08)',
        'card':       '0 1px 3px rgb(0 0 0 / 0.12), 0 4px 16px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px rgb(0 0 0 / 0.15), 0 16px 40px rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
};
