import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // TBSB navy (logo #00009A)
        brand: {
          50: '#eef0ff',
          100: '#dde1ff',
          200: '#c2c8ff',
          300: '#9ba3ff',
          400: '#6f74fb',
          500: '#4a4cf0',
          600: '#2e2bd9',
          700: '#1d1ab8',
          800: '#0b0a9a',
          900: '#08077a',
          950: '#05044b',
        },
        // TBSB red (logo #D13F36)
        accent: {
          50: '#fdf3f2',
          100: '#fce4e2',
          200: '#facdca',
          300: '#f5aaa5',
          400: '#ed7a72',
          500: '#e05248',
          600: '#d13f36',
          700: '#ab2c24',
          800: '#8e2822',
          900: '#762722',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        elevated: '0 10px 30px -10px rgb(15 23 42 / 0.25)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-in-left': 'slide-in-left 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};
