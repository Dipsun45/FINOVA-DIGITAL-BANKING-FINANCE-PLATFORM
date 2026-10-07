/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finova: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#bae0fd',
          300: '#7cc7fd',
          400: '#36a8fa',
          500: '#0c87e7',
          600: '#0267c5',
          700: '#0352a0',
          800: '#074683',
          900: '#0c3b6e',
          950: '#082548'
        },
        dark: {
          bg: '#0B0F17',
          card: '#131B2E',
          hover: '#1B2640',
          border: '#1E293B',
          accent: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        }
      }
    }
  },
  plugins: []
};
